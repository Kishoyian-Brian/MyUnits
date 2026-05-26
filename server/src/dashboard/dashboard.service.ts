import { Injectable } from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(user: JwtPayloadUser) {
    const propertyWhere = this.buildPropertyWhere(user);
    const unitWhere = { property: propertyWhere };
    const leaseWhere = { unit: { property: propertyWhere } };

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [
      totalProperties,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      totalTenants,
      activeLeases,
      overdueInvoices,
      openMaintenance,
    ] = await Promise.all([
      this.prisma.property.count({ where: propertyWhere }),
      this.prisma.unit.count({ where: unitWhere }),
      this.prisma.unit.count({ where: { ...unitWhere, status: 'OCCUPIED' } }),
      this.prisma.unit.count({ where: { ...unitWhere, status: 'VACANT' } }),
      this.prisma.unit.count({ where: { ...unitWhere, status: 'MAINTENANCE' } }),
      this.prisma.tenant.count({
        where: { leases: { some: { unit: { property: propertyWhere } } } },
      }),
      this.prisma.lease.count({ where: { ...leaseWhere, status: 'ACTIVE' } }),
      this.prisma.invoice.count({
        where: { lease: leaseWhere, status: 'OVERDUE' },
      }),
      this.prisma.maintenanceRequest.count({
        where: { unit: { property: propertyWhere }, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
    ]);

    const revenueThisMonth = await this.prisma.payment.aggregate({
      where: {
        invoice: {
          lease: leaseWhere,
          month: currentMonth,
          year: currentYear,
        },
      },
      _sum: { amount: true },
    });

    const expectedThisMonth = await this.prisma.invoice.aggregate({
      where: {
        lease: leaseWhere,
        month: currentMonth,
        year: currentYear,
      },
      _sum: { totalAmount: true },
    });

    const expensesThisMonth = await this.prisma.expense.aggregate({
      where: {
        property: propertyWhere,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
      _sum: { amount: true },
    });

    const overdueAmount = await this.prisma.invoice.aggregate({
      where: { lease: leaseWhere, status: 'OVERDUE' },
      _sum: { totalAmount: true },
    });

    const revenue = Number(revenueThisMonth._sum.amount ?? 0);
    const expected = Number(expectedThisMonth._sum.totalAmount ?? 0);
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0;
    const collectionRate = expected > 0 ? Math.round((revenue / expected) * 1000) / 10 : 0;

    return {
      totalProperties,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      occupancyRate,
      totalTenants,
      activeLeases,
      revenueThisMonth: revenue,
      expectedThisMonth: expected,
      collectionRate,
      overdueInvoices,
      overdueAmount: Number(overdueAmount._sum.totalAmount ?? 0),
      openMaintenanceRequests: openMaintenance,
      totalExpensesThisMonth: Number(expensesThisMonth._sum.amount ?? 0),
    };
  }

  async getRevenue(user: JwtPayloadUser, year: number, month?: number) {
    const propertyWhere = this.buildPropertyWhere(user);
    const leaseWhere = { unit: { property: propertyWhere } };

    const invoiceWhere: Record<string, unknown> = {
      lease: leaseWhere,
      year,
    };
    if (month) invoiceWhere.month = month;

    const [invoiceAgg, paymentAgg] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: invoiceWhere,
        _sum: { totalAmount: true, rentAmount: true, utilityAmount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { invoice: invoiceWhere },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      period: month ? `${year}-${String(month).padStart(2, '0')}` : `${year}`,
      totalInvoiced: Number(invoiceAgg._sum.totalAmount ?? 0),
      rentInvoiced: Number(invoiceAgg._sum.rentAmount ?? 0),
      utilityInvoiced: Number(invoiceAgg._sum.utilityAmount ?? 0),
      invoiceCount: invoiceAgg._count,
      totalCollected: Number(paymentAgg._sum.amount ?? 0),
      paymentCount: paymentAgg._count,
    };
  }

  async getOccupancy(user: JwtPayloadUser) {
    const propertyWhere = this.buildPropertyWhere(user);

    const properties = await this.prisma.property.findMany({
      where: propertyWhere,
      select: {
        id: true,
        name: true,
        location: true,
        _count: { select: { units: true } },
        units: {
          select: { status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      properties: properties.map((p) => {
        const total = p._count.units;
        const occupied = p.units.filter((u) => u.status === 'OCCUPIED').length;
        const vacant = p.units.filter((u) => u.status === 'VACANT').length;
        const maintenance = p.units.filter((u) => u.status === 'MAINTENANCE').length;

        return {
          id: p.id,
          name: p.name,
          location: p.location,
          totalUnits: total,
          occupied,
          vacant,
          maintenance,
          occupancyRate: total > 0 ? Math.round((occupied / total) * 1000) / 10 : 0,
        };
      }),
    };
  }

  private buildPropertyWhere(user: JwtPayloadUser) {
    if (user.role === UserRole.LANDLORD) {
      return { ownerId: user.userId };
    }
    return undefined;
  }
}

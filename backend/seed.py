"""
Seed script — populates DB with realistic dummy data for all 3 roles.
Run: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password
from datetime import datetime

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def clear():
    for tbl in reversed(Base.metadata.sorted_tables):
        db.execute(tbl.delete())
    db.commit()
    print("Cleared existing data.")


def seed():
    clear()

    # ── Users ──────────────────────────────────────────────────────────────────
    admin = models.User(
        name="Arjun Sharma", email="admin@energiaudit.com",
        password_hash=hash_password("admin123"),
        role=models.UserRole.admin, is_approved=True,
    )
    auditor1 = models.User(
        name="Priya Menon", email="auditor@energiaudit.com",
        password_hash=hash_password("audit123"),
        role=models.UserRole.auditor, is_approved=True,
    )
    auditor2 = models.User(
        name="Rahul Verma", email="rahul.auditor@energiaudit.com",
        password_hash=hash_password("audit123"),
        role=models.UserRole.auditor, is_approved=False,
    )
    client1 = models.User(
        name="TechCorp Pvt Ltd", email="client@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.office,
        org_size=250, floor_area_sqft=15000, is_approved=True,
        location="Mumbai, Maharashtra",
        about="TechCorp is a leading software development firm specializing in cloud infrastructure and enterprise AI solutions. Their headquarters in Mumbai features high-density server rooms and open-plan workstations."
    )
    client2 = models.User(
        name="Green Valley School", email="school@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.school,
        org_size=1200, floor_area_sqft=40000, is_approved=True,
        location="Pune, Maharashtra",
        about="Green Valley is an K-12 educational institution with a sprawling campus including multiple academic blocks, a gymnasium, and large outdoor lighting requirements."
    )
    client3 = models.User(
        name="Metro Hospital", email="hospital@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.hospital,
        org_size=500, floor_area_sqft=60000, is_approved=True,
        location="Bangalore, Karnataka",
        about="Metro Hospital is a multi-specialty healthcare facility operating 24/7. It has significant energy consumption from medical imaging equipment, centralized HVAC, and emergency power systems."
    )
    client4 = models.User(
        name="BlueSteel Manufacturing", email="factory@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.factory,
        org_size=450, floor_area_sqft=120000, is_approved=True,
        location="Chennai, Tamil Nadu",
        about="BlueSteel is a heavy-duty steel fabrication plant. Their energy profile is dominated by induction furnaces, overhead cranes, and 24-hour industrial lighting."
    )
    client5 = models.User(
        name="Zenith University", email="university@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.school,
        org_size=8500, floor_area_sqft=350000, is_approved=True,
        location="Delhi, NCR",
        about="Zenith University is a premier research institution. The campus includes massive lecture halls, high-tech laboratories, and residential hostels with high water-heating and cooling demands."
    )
    client6 = models.User(
        name="Urban Mart Plaza", email="retail@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.retail,
        org_size=120, floor_area_sqft=45000, is_approved=True,
        location="Hyderabad, Telangana",
        about="Urban Mart is a premium shopping mall. Energy intensive areas include the central atrium cooling, digital signage, and escalator systems."
    )
    client7 = models.User(
        name="Grand Horizon Hotel", email="hotel@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.other,
        org_size=350, floor_area_sqft=85000, is_approved=True,
        location="Jaipur, Rajasthan",
        about="Grand Horizon is a 5-star luxury hotel. High energy consumption comes from 24/7 central HVAC, laundry facilities, heated swimming pools, and extensive aesthetic lighting."
    )
    client8 = models.User(
        name="Nexus Data Center", email="datacenter@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.office,
        org_size=50, floor_area_sqft=25000, is_approved=True,
        location="Pune, Maharashtra",
        about="Nexus operates a Tier 3 data center facility. The energy profile is overwhelmingly dominated by server racks and precision cooling (CRAC units) to maintain strict temperature thresholds."
    )
    client9 = models.User(
        name="Apex Textile Mills", email="textile@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.factory,
        org_size=800, floor_area_sqft=150000, is_approved=True,
        location="Surat, Gujarat",
        about="Apex Textiles is a large-scale spinning and weaving facility. Continuous operation of power looms, spinning machines, and dyeing units contribute to immense electrical and thermal loads."
    )
    client10 = models.User(
        name="Global Finance Bank", email="bank@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.office,
        org_size=1200, floor_area_sqft=65000, is_approved=True,
        location="Mumbai, Maharashtra",
        about="A major corporate banking headquarters. The facility features open-plan offices, dedicated trading floors with high computing density, and standard corporate HVAC systems."
    )
    client11 = models.User(
        name="State Tech University", email="techuni@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.school,
        org_size=12000, floor_area_sqft=450000, is_approved=True,
        location="Kolkata, West Bengal",
        about="A sprawling state-run technical university. Energy consumption is spread across multiple departments, specialized engineering workshops, auditoriums, and massive campus lighting."
    )
    client12 = models.User(
        name="City General Hospital", email="cityhospital@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.hospital,
        org_size=900, floor_area_sqft=110000, is_approved=True,
        location="Chennai, Tamil Nadu",
        about="A large public healthcare facility handling thousands of outpatients daily. Key energy loads include ICUs, operation theaters, large-scale autoclaves, and continuous central cooling."
    )
    client13 = models.User(
        name="International Airport Authority", email="airport@energiaudit.com",
        password_hash=hash_password("client123"),
        role=models.UserRole.client, org_type=models.OrgType.other,
        org_size=2500, floor_area_sqft=800000, is_approved=True,
        location="Bengaluru, Karnataka",
        about="The main terminal for domestic and international flights. Huge energy consumption from baggage handling systems, continuous terminal air conditioning, runway lighting, and retail zones."
    )

    db.add_all([admin, auditor1, auditor2, client1, client2, client3, client4, client5, client6, client7, client8, client9, client10, client11, client12, client13])
    db.commit()
    for u in [admin, auditor1, auditor2, client1, client2, client3, client4, client5, client6, client7, client8, client9, client10, client11, client12, client13]:
        db.refresh(u)
    print(f"Created 16 users.")

    # ── Energy Data (client1 – 18 months) ─────────────────────────────────────
    energy_values = [
        (1, 2024, 42000, 294000), (2, 2024, 38500, 269500), (3, 2024, 41200, 288400),
        (4, 2024, 39800, 278600), (5, 2024, 44500, 311500), (6, 2024, 51200, 358400),
        (7, 2024, 55600, 389200), (8, 2024, 53800, 376600), (9, 2024, 48900, 342300),
        (10, 2024, 44200, 309400), (11, 2024, 40100, 280700), (12, 2024, 43500, 304500),
        (1, 2025, 39200, 274400), (2, 2025, 36800, 257600), (3, 2025, 38500, 269500),
        (4, 2025, 37200, 260400), (5, 2025, 41000, 287000), (6, 2025, 46500, 325500),
    ]
    for m, y, kwh, cost in energy_values:
        db.add(models.EnergyData(user_id=client1.id, month=m, year=y,
                                  units_kwh=kwh, cost_inr=cost, source="manual"))

    # client2 energy data (12 months)
    school_energy = [
        (1, 2024, 28000, 196000), (2, 2024, 25500, 178500), (3, 2024, 29200, 204400),
        (4, 2024, 27800, 194600), (5, 2024, 31500, 220500), (6, 2024, 18200, 127400),
        (7, 2024, 12600, 88200),  (8, 2024, 13800, 96600),  (9, 2024, 26900, 188300),
        (10, 2024, 30200, 211400), (11, 2024, 28100, 196700), (12, 2024, 15500, 108500),
    ]
    for m, y, kwh, cost in school_energy:
        db.add(models.EnergyData(user_id=client2.id, month=m, year=y,
                                  units_kwh=kwh, cost_inr=cost, source="manual"))

    # client3 energy data
    hospital_energy = [
        (1, 2024, 85000, 595000), (2, 2024, 78500, 549500), (3, 2024, 88200, 617400),
        (4, 2024, 84800, 593600), (5, 2024, 91500, 640500), (6, 2024, 98200, 687400),
        (7, 2024, 102600, 718200), (8, 2024, 99800, 698600), (9, 2024, 93900, 657300),
        (10, 2024, 87200, 610400), (11, 2024, 82100, 574700), (12, 2024, 86500, 605500),
    ]
    for m, y, kwh, cost in hospital_energy:
        db.add(models.EnergyData(user_id=client3.id, month=m, year=y,
                                  units_kwh=kwh, cost_inr=cost, source="manual"))

    import random
    for cl, base_kwh in [(client7, 60000), (client8, 120000), (client9, 150000), (client10, 45000), (client11, 75000), (client12, 95000), (client13, 250000)]:
        for m in range(1, 13):
            kwh = base_kwh * (1.0 + random.uniform(-0.1, 0.1))
            cost = kwh * 7.5
            db.add(models.EnergyData(user_id=cl.id, month=m, year=2024,
                                      units_kwh=kwh, cost_inr=cost, source="simulated"))

    db.commit()
    print("Created energy data.")

    # ── Audits ─────────────────────────────────────────────────────────────────
    audit1 = models.Audit(
        client_id=client1.id, auditor_id=auditor1.id,
        status=models.AuditStatus.completed,
        recommendations=(
            "1. Install LED lighting in all office areas\n"
            "2. Implement HVAC scheduling — reduce runtime by 2 hours/day\n"
            "3. Enable power management on 150+ workstations\n"
            "4. Consider rooftop solar (50kW) to offset peak loads\n"
            "5. Install occupancy sensors in meeting rooms"
        ),
        efficiency_score=72.5,
        estimated_savings_inr=480000,
        report_url=None,
        notes="Annual energy audit for FY 2024",
    )
    audit2 = models.Audit(
        client_id=client2.id, auditor_id=auditor1.id,
        status=models.AuditStatus.in_progress,
        notes="School campus annual audit",
    )
    audit3 = models.Audit(
        client_id=client3.id, auditor_id=None,
        status=models.AuditStatus.pending,
        notes="Hospital seeking energy certification",
    )
    audit4 = models.Audit(
        client_id=client1.id, auditor_id=auditor1.id,
        status=models.AuditStatus.completed,
        recommendations=(
            "1. Replace old AC units with 5-star BEE rated models\n"
            "2. Solar water heating system for pantry\n"
            "3. Motion-sensor lighting in corridors"
        ),
        efficiency_score=81.0,
        estimated_savings_inr=620000,
        notes="Follow-up audit Q1 2025",
    )
    audit5 = models.Audit(
        client_id=client4.id, auditor_id=auditor1.id,
        status=models.AuditStatus.in_progress,
        notes="Industrial energy efficiency assessment",
    )
    audit6 = models.Audit(
        client_id=client5.id, auditor_id=None,
        status=models.AuditStatus.pending,
        notes="Campus-wide sustainability audit",
    )
    audit7 = models.Audit(
        client_id=client6.id, auditor_id=auditor1.id,
        status=models.AuditStatus.completed,
        recommendations=(
            "1. Optimize central chiller plant settings\n"
            "2. Switch to LED display panels for all retail signage\n"
            "3. Install VFDs on escalator motors"
        ),
        efficiency_score=68.5,
        estimated_savings_inr=320000,
        notes="Retail space periodic audit",
    )
    audit8 = models.Audit(
        client_id=client7.id, auditor_id=auditor1.id,
        status=models.AuditStatus.completed,
        recommendations="1. Install smart thermostats in all guest rooms\n2. Upgrade laundry equipment to energy-star rated models",
        efficiency_score=65.0, estimated_savings_inr=420000, notes="Hotel energy audit"
    )
    audit9 = models.Audit(
        client_id=client8.id, auditor_id=None,
        status=models.AuditStatus.pending,
        notes="Data center PUE assessment requested"
    )
    audit10 = models.Audit(
        client_id=client9.id, auditor_id=auditor1.id,
        status=models.AuditStatus.in_progress,
        notes="Textile mill thermal and electrical audit"
    )
    audit11 = models.Audit(
        client_id=client11.id, auditor_id=auditor1.id,
        status=models.AuditStatus.completed,
        recommendations="1. Campus-wide LED retrofit\n2. Solar PV installation on academic blocks",
        efficiency_score=70.0, estimated_savings_inr=850000, notes="University campus audit"
    )

    db.add_all([audit1, audit2, audit3, audit4, audit5, audit6, audit7, audit8, audit9, audit10, audit11])
    db.commit()
    for a in [audit1, audit2, audit3, audit4, audit5, audit6, audit7, audit8, audit9, audit10, audit11]:
        db.refresh(a)
    print("Created audits.")

    # ── Savings ────────────────────────────────────────────────────────────────
    db.add(models.Savings(
        user_id=client1.id, audit_id=audit1.id,
        period_before="Jan–Jun 2024", period_after="Jan–Jun 2025",
        before_usage_kwh=268700, after_usage_kwh=239200,
        savings_amount_inr=206500, pct_improvement=11.0,
    ))
    db.add(models.Savings(
        user_id=client1.id, audit_id=audit4.id,
        period_before="Jul–Dec 2024", period_after="Jan–Mar 2025",
        before_usage_kwh=286100, after_usage_kwh=238500,
        savings_amount_inr=333200, pct_improvement=16.6,
    ))
    db.commit()
    print("Created savings records.")

    # ── Notifications ─────────────────────────────────────────────────────────
    notifs = [
        models.Notification(user_id=client1.id,
            message="Your energy audit is complete! Score: 72.5/100. Estimated savings: ₹4,80,000/year.",
            type=models.NotificationType.audit_update),
        models.Notification(user_id=client1.id,
            message="⚡ Peak usage detected in July 2024 — 55,600 kWh. Review AC and server room loads.",
            type=models.NotificationType.alert),
        models.Notification(user_id=client1.id,
            message="New recommendation: Install LED lighting to save 15% on electricity bills.",
            type=models.NotificationType.recommendation),
        models.Notification(user_id=client1.id,
            message="Follow-up audit complete! Efficiency score improved to 81.0/100. ₹6,20,000 potential savings.",
            type=models.NotificationType.audit_update, is_read=True),
        models.Notification(user_id=client2.id,
            message="Your audit request has been accepted by Priya Menon and is now in progress.",
            type=models.NotificationType.audit_update),
        models.Notification(user_id=client3.id,
            message="Your audit request has been submitted. An auditor will be assigned shortly.",
            type=models.NotificationType.audit_update),
        models.Notification(user_id=auditor1.id,
            message="New audit request from Metro Hospital awaiting assignment.",
            type=models.NotificationType.system),
        models.Notification(user_id=auditor2.id,
            message="Your auditor account is pending admin approval. You will be notified once approved.",
            type=models.NotificationType.system),
    ]
    db.add_all(notifs)
    db.commit()
    print("Created notifications.")

    # ── ROI Calculations ──────────────────────────────────────────────────────
    db.add(models.ROICalculation(
        user_id=client1.id, investment_inr=1500000,
        monthly_savings_inr=40000, payback_months=37.5,
        roi_pct=220.0, investment_type="Rooftop Solar (50kW)",
    ))
    db.add(models.ROICalculation(
        user_id=client1.id, investment_inr=250000,
        monthly_savings_inr=12000, payback_months=20.8,
        roi_pct=476.0, investment_type="LED Lighting Upgrade",
    ))
    db.commit()
    print("Created ROI calculations.")

    # ── Badges ────────────────────────────────────────────────────────────────
    db.add(models.Badge(user_id=client1.id, badge_type=models.BadgeType.energy_efficient))
    db.add(models.Badge(user_id=client1.id, badge_type=models.BadgeType.top_saver))
    db.add(models.Badge(user_id=client2.id, badge_type=models.BadgeType.quick_adopter))
    db.commit()
    print("Created badges.")

    print("\nSeed complete!")
    print("=" * 50)
    print("Login credentials:")
    print("  Admin:   admin@energiaudit.com   / admin123")
    print("  Auditor: auditor@energiaudit.com / audit123")
    print("  Client:  client@energiaudit.com  / client123")
    print("=" * 50)


if __name__ == "__main__":
    seed()
    db.close()

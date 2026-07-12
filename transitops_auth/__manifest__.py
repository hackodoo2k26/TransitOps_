{
    'name': 'TransitOps',
    'version': '1.0',
    'category': 'Operations/Transport',
    'summary': 'Smart Transport Operations Platform',
    'description': """
        TransitOps - Smart Transport Operations Platform
        =================================================
        Manages vehicles, drivers, trips, maintenance, fuel/expense, and analytics.
    """,
    'depends': ['base', 'mail', 'web'],
    'data': [
        'security/security_groups.xml',
        'security/ir.model.access.csv',
        'views/users_view.xml',
        'views/vehicle_views.xml',
        'views/driver_views.xml',
        'views/trip_views.xml',
        'views/maintenance_views.xml',
        'views/fuel_log_views.xml',
        'views/expense_views.xml',
        'data/default_roles.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}

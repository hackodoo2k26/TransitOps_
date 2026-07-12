from odoo import models, fields


class Vehicle(models.Model):
    _name = 'transitops.vehicle'
    _description = 'Vehicle'
    _order = 'registration_number'

    registration_number = fields.Char(string='Registration Number', required=True, unique=True)
    model_name = fields.Char(string='Model Name', required=True)
    type = fields.Selection([
        ('van', 'Van'),
        ('truck', 'Truck'),
        ('bus', 'Bus'),
        ('car', 'Car'),
    ], string='Type', required=True, default='van')
    max_load_capacity = fields.Float(string='Max Load Capacity (kg)', required=True)
    odometer = fields.Float(string='Odometer (km)', default=0.0)
    acquisition_cost = fields.Monetary(string='Acquisition Cost', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', string='Currency', default=lambda self: self.env.company.currency_id)
    region = fields.Char(string='Region')
    status = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('in_shop', 'In Shop'),
        ('retired', 'Retired'),
    ], string='Status', required=True, default='available')

    trip_ids = fields.One2many('transitops.trip', 'vehicle_id', string='Trips')
    maintenance_log_ids = fields.One2many('transitops.maintenance_log', 'vehicle_id', string='Maintenance Logs')
    fuel_log_ids = fields.One2many('transitops.fuel_log', 'vehicle_id', string='Fuel Logs')
    expense_ids = fields.One2many('transitops.expense', 'vehicle_id', string='Expenses')

from odoo import models, fields


class Driver(models.Model):
    _name = 'transitops.driver'
    _description = 'Driver'
    _order = 'name'

    name = fields.Char(string='Name', required=True)
    license_number = fields.Char(string='License Number', required=True)
    license_category = fields.Char(string='License Category', required=True)
    license_expiry_date = fields.Date(string='License Expiry Date', required=True)
    contact_number = fields.Char(string='Contact Number')
    safety_score = fields.Float(string='Safety Score', default=100.0, group_operator='avg')
    status = fields.Selection([
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('off_duty', 'Off Duty'),
        ('suspended', 'Suspended'),
    ], string='Status', required=True, default='available')

    trip_ids = fields.One2many('transitops.trip', 'driver_id', string='Trips')

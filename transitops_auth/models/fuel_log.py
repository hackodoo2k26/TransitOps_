from odoo import models, fields


class FuelLog(models.Model):
    _name = 'transitops.fuel_log'
    _description = 'Fuel Log'
    _order = 'date desc, id desc'

    vehicle_id = fields.Many2one('transitops.vehicle', string='Vehicle', required=True)
    trip_id = fields.Many2one('transitops.trip', string='Trip')
    liters = fields.Float(string='Liters', required=True)
    cost = fields.Monetary(string='Cost', currency_field='currency_id', required=True)
    currency_id = fields.Many2one('res.currency', string='Currency', default=lambda self: self.env.company.currency_id)
    date = fields.Date(string='Date', required=True, default=fields.Date.today)

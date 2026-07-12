from odoo import models, fields


class Expense(models.Model):
    _name = 'transitops.expense'
    _description = 'Expense'
    _order = 'date desc, id desc'

    vehicle_id = fields.Many2one('transitops.vehicle', string='Vehicle', required=True)
    type = fields.Selection([
        ('toll', 'Toll'),
        ('parking', 'Parking'),
        ('misc', 'Miscellaneous'),
    ], string='Type', required=True, default='misc')
    amount = fields.Monetary(string='Amount', currency_field='currency_id', required=True)
    currency_id = fields.Many2one('res.currency', string='Currency', default=lambda self: self.env.company.currency_id)
    date = fields.Date(string='Date', required=True, default=fields.Date.today)

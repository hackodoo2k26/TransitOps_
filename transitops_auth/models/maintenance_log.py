from odoo import models, fields, api
from odoo.exceptions import ValidationError


class MaintenanceLog(models.Model):
    _name = 'transitops.maintenance_log'
    _description = 'Maintenance Log'
    _order = 'date desc, id desc'

    vehicle_id = fields.Many2one('transitops.vehicle', string='Vehicle', required=True)
    description = fields.Text(string='Description', required=True)
    cost = fields.Monetary(string='Cost', currency_field='currency_id', required=True)
    currency_id = fields.Many2one('res.currency', string='Currency', default=lambda self: self.env.company.currency_id)
    date = fields.Date(string='Date', required=True, default=fields.Date.today)
    status = fields.Selection([
        ('active', 'Active'),
        ('closed', 'Closed'),
    ], string='Status', required=True, default='active')

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            if record.status == 'active':
                record.vehicle_id.write({'status': 'in_shop'})
        return records

    def action_close(self):
        for log in self:
            if log.status != 'active':
                raise ValidationError("Only active maintenance logs can be closed")
            log.write({'status': 'closed'})
            if log.vehicle_id and log.vehicle_id.status != 'retired':
                log.vehicle_id.write({'status': 'available'})

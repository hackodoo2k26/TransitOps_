from odoo import models, fields, api
from odoo.exceptions import ValidationError


class Trip(models.Model):
    _name = 'transitops.trip'
    _description = 'Trip'
    _order = 'id desc'

    source = fields.Char(string='Source', required=True)
    destination = fields.Char(string='Destination', required=True)
    vehicle_id = fields.Many2one('transitops.vehicle', string='Vehicle', required=True)
    driver_id = fields.Many2one('transitops.driver', string='Driver', required=True)
    user_id = fields.Many2one('res.users', string='Created By', default=lambda self: self.env.user)
    cargo_weight = fields.Float(string='Cargo Weight (kg)')
    planned_distance = fields.Float(string='Planned Distance (km)')
    start_odometer = fields.Float(string='Start Odometer (km)')
    end_odometer = fields.Float(string='End Odometer (km)')
    fuel_consumed = fields.Float(string='Fuel Consumed (L)')
    revenue = fields.Monetary(string='Revenue', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', string='Currency', default=lambda self: self.env.company.currency_id)
    status = fields.Selection([
        ('draft', 'Draft'),
        ('dispatched', 'Dispatched'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', required=True, default='draft')

    @api.constrains('cargo_weight', 'vehicle_id')
    def _check_cargo_weight(self):
        for trip in self:
            if trip.cargo_weight and trip.vehicle_id and trip.cargo_weight > trip.vehicle_id.max_load_capacity:
                raise ValidationError(
                    f"Cargo weight ({trip.cargo_weight} kg) exceeds vehicle max load ({trip.vehicle_id.max_load_capacity} kg)"
                )

    @api.constrains('driver_id', 'vehicle_id', 'status')
    def _check_not_on_trip(self):
        for trip in self:
            if trip.status == 'dispatched':
                if trip.driver_id and trip.driver_id.status == 'on_trip':
                    raise ValidationError("Driver is already on another trip")
                if trip.vehicle_id and trip.vehicle_id.status == 'on_trip':
                    raise ValidationError("Vehicle is already on another trip")

    def action_dispatch(self):
        for trip in self:
            if trip.status != 'draft':
                raise ValidationError("Only draft trips can be dispatched")
            driver = trip.driver_id
            vehicle = trip.vehicle_id
            if driver.status == 'suspended':
                raise ValidationError("Suspended driver cannot be assigned")
            if driver.license_expiry_date and driver.license_expiry_date < fields.Date.today():
                raise ValidationError("Driver license is expired")
            if vehicle.status in ('retired', 'in_shop'):
                raise ValidationError(f"Vehicle is {vehicle.status} and cannot be dispatched")
            trip.write({'status': 'dispatched'})
            driver.write({'status': 'on_trip'})
            vehicle.write({'status': 'on_trip', 'odometer': trip.start_odometer or vehicle.odometer})

    def action_complete(self):
        for trip in self:
            if trip.status != 'dispatched':
                raise ValidationError("Only dispatched trips can be completed")
            if not trip.end_odometer:
                raise ValidationError("End odometer is required to complete trip")
            trip.write({'status': 'completed'})
            if trip.driver_id:
                trip.driver_id.write({'status': 'available'})
            if trip.vehicle_id:
                trip.vehicle_id.write({'status': 'available', 'odometer': trip.end_odometer})

    def action_cancel(self):
        for trip in self:
            if trip.status == 'completed':
                raise ValidationError("Completed trips cannot be cancelled")
            trip.write({'status': 'cancelled'})
            if trip.driver_id and trip.driver_id.status == 'on_trip':
                trip.driver_id.write({'status': 'available'})
            if trip.vehicle_id and trip.vehicle_id.status == 'on_trip':
                trip.vehicle_id.write({'status': 'available'})

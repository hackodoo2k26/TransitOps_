from odoo import models, fields, api
from odoo.exceptions import AccessDenied
import hashlib
import hmac
import json
import base64
import time


class ResUsers(models.Model):
    _inherit = 'res.users'

    role = fields.Selection([
        ('fleet_manager', 'Fleet Manager'),
        ('driver', 'Driver'),
        ('safety_officer', 'Safety Officer'),
        ('financial_analyst', 'Financial Analyst'),
    ], string='TransitOps Role', default='driver',
       help='Role assigned to the user for TransitOps platform access control')

    @api.model
    def generate_jwt(self, user_id):
        user = self.browse(user_id)
        if not user.exists():
            raise AccessDenied("User not found")
        header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).rstrip(b'=').decode()
        payload_data = {
            "uid": user.id,
            "email": user.login,
            "name": user.name,
            "role": user.role,
            "iat": int(time.time()),
            "exp": int(time.time()) + 86400,
        }
        payload = base64.urlsafe_b64encode(json.dumps(payload_data).encode()).rstrip(b'=').decode()
        secret = self._get_jwt_secret()
        signature = hmac.new(secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
        sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b'=').decode()
        return f"{header}.{payload}.{sig_b64}"

    @api.model
    def verify_jwt(self, token):
        try:
            parts = token.split('.')
            if len(parts) != 3:
                return False
            header_b64, payload_b64, sig_b64 = parts
            secret = self._get_jwt_secret()
            expected_sig = hmac.new(secret.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
            expected_b64 = base64.urlsafe_b64encode(expected_sig).rstrip(b'=').decode()
            if not hmac.compare_digest(expected_b64, sig_b64):
                return False
            payload = json.loads(base64.urlsafe_b64decode(payload_b64 + '=='))
            if payload.get('exp', 0) < time.time():
                return False
            return payload
        except Exception:
            return False

    @api.model
    def _get_jwt_secret(self):
        return self.env['ir.config_parameter'].sudo().get_param('transitops.jwt_secret', default='transitops-hackathon-secret-key')

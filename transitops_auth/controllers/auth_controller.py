from odoo import http
from odoo.http import request
from odoo.exceptions import AccessDenied
import json


class AuthController(http.Controller):

    @http.route('/auth/login', type='http', auth='none', methods=['POST'], csrf=False, cors='*')
    def login(self, **kwargs):
        try:
            data = json.loads(request.httprequest.data)
        except (ValueError, TypeError):
            data = kwargs

        login = data.get('login') or data.get('email', '')
        password = data.get('password', '')

        if not login or not password:
            return http.Response(
                json.dumps({'error': 'Login and password required'}),
                status=400,
                content_type='application/json',
            )

        try:
            uid = request.session.authenticate(request.db, login, password)
        except Exception:
            uid = False

        if not uid:
            return http.Response(
                json.dumps({'error': 'Invalid credentials'}),
                status=401,
                content_type='application/json',
            )

        user = request.env['res.users'].sudo().browse(uid)
        token = user.sudo().generate_jwt(uid)

        return http.Response(
            json.dumps({
                'token': token,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.login,
                    'role': user.role,
                },
            }),
            status=200,
            content_type='application/json',
        )

    @http.route('/auth/me', type='http', auth='none', methods=['GET'], csrf=False, cors='*')
    def me(self, **kwargs):
        auth_header = request.httprequest.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return http.Response(
                json.dumps({'error': 'Missing or invalid token'}),
                status=401,
                content_type='application/json',
            )

        token = auth_header[7:]
        payload = request.env['res.users'].sudo().verify_jwt(token)

        if not payload:
            return http.Response(
                json.dumps({'error': 'Invalid or expired token'}),
                status=401,
                content_type='application/json',
            )

        user = request.env['res.users'].sudo().browse(payload['uid'])
        if not user.exists():
            return http.Response(
                json.dumps({'error': 'User not found'}),
                status=404,
                content_type='application/json',
            )

        return http.Response(
            json.dumps({
                'id': user.id,
                'name': user.name,
                'email': user.login,
                'role': user.role,
            }),
            status=200,
            content_type='application/json',
        )

    @http.route('/auth/roles', type='http', auth='none', methods=['GET'], csrf=False, cors='*')
    def roles(self, **kwargs):
        roles = request.env['res.users'].sudo().fields_get(['role'])['role']['selection']
        return http.Response(
            json.dumps([{'value': v, 'label': l} for v, l in roles]),
            status=200,
            content_type='application/json',
        )

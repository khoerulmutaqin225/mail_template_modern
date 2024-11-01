# -*- coding: utf-8 -*-
{
    'name': "Mail Template Header Footer Modern",

    'summary': "Short (1 phrase/line) summary of the module's purpose",

    'description': """
Long description of module's purpose
    """,

    'author': "Mutaqin",
    'website': "https://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Mail Custom',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','mail','web'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'data/mail_templates_modern_layout.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'mail_template_modern/static/src/core/common/composer.js'
        ],
    },
    # only loaded in demonstration mode
    'demo': [
        # 'demo/demo.xml',
    ],
}


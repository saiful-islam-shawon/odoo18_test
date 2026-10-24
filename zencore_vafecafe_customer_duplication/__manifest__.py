{
    "name": "Zencore Vafecafe Customer Duplication",
    "version": "18.0.1.1.0",
    "category": "Website/eCommerce",
    "summary": "Prevent duplicate customers during guest checkout and signup",
    "author": "Saiful islam shawon",
    "license": "LGPL-3",

    "depends": [
        "website_sale",
        "meta_otp_auth",
        "point_of_sale",
    ],

    "data": [],

    "assets": {
        "point_of_sale._assets_pos": [
            "zencore_vafecafe_customer_duplication/static/src/app/**/*",
        ],
    },

    "installable": True,
    "application": False,
}
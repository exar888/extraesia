# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "extraesia"
app_title = "Extraesia"
app_publisher = "Youssef Restom"
app_description = "Customization App For Erpnext"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "youssef@totrox.com"
app_license = "MIT"

# Includes in <head>
# ------------------
fixtures = [

	{"doctype":"Custom Field", "filters": [["_user_tags", "like", ("%extraesia%")]]}

]
# include js, css files in header of desk.html
# app_include_css = "/assets/extraesia/css/extraesia.css"
# app_include_js = "/assets/extraesia/js/extraesia.js"

# include js, css files in header of web template
# web_include_css = "/assets/extraesia/css/extraesia.css"
# web_include_js = "/assets/extraesia/js/extraesia.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"Item" : "public/js/list_view.js"}
doctype_list_js = {"Item" : "public/js/list_view.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "extraesia.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "extraesia.install.before_install"
# after_install = "extraesia.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "extraesia.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

doc_events = {
	"Stock Ledger Entry": {
		"after_insert": "extraesia.item.set_item_balance",
		"on_trash": "extraesia.item.set_item_balance_on_delete",
	},
	"Stock Reconciliation": {
		"on_cancel": "extraesia.item.set_item_balance_after_delete_stock_reconciliation",	
	},
    "Sales Order": {
		"validate": "extraesia.slaes_order.validate_items_stock_level",
		"on_submit": "extraesia.item.set_item_available_qty",
		"on_cancel": "extraesia.item.set_item_available_qty",
	},
}
# Scheduled Tasks
# ---------------

scheduler_events = {
# 	"all": [
# 		"extraesia.tasks.all"
# 	],
	"daily": [
		"extraesia.item.recalculate_items_balance"
	],
# 	"hourly": [
# 		"extraesia.tasks.hourly"
# 	],
# 	"weekly": [
# 		"extraesia.tasks.weekly"
# 	]
# 	"monthly": [
# 		"extraesia.tasks.monthly"
# 	]
}

# Testing
# -------

# before_tests = "extraesia.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "extraesia.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "extraesia.task.get_dashboard_data"
# }


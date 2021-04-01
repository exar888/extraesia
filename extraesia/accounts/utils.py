from __future__ import unicode_literals
import frappe
from frappe import _
import json
import logging

@frappe.whitelist()
def get_manufacture_account(item_codes):
    # select item_code, item_name, item_group from tabItem
    item_codes = json.loads(item_codes)
    query_items = """SELECT item_code, item_name, item_group FROM `tabItem` WHERE item_code IN ({item_code})"""
    items = frappe.db.sql(query_items.format(item_code=", ".join(["%s"]*len(item_codes))), tuple(item_codes), as_dict=True)
    query_item_default = """SELECT manufacture_difference_account FROM `tabItem Default` WHERE parent = %s and company = %s"""
    accounts = {}
    company = frappe.db.get_value("Global Defaults", None, "default_company")
    for item in items:
        # select manufacture_difference_account from tabItem Default where parent = item_code and company = company
        account = get_manufacture_account_by(company, item.item_code)
        if account != "":
            accounts[item.item_code] = account
            continue
        
        # if null, select manufacture_difference_account from tabItem Default where parent = item_group and company = company
        accounts[item.item_code] = get_manufacture_account_by(company, item.item_group)

    return accounts

def get_manufacture_account_by(company, param):
    query_item_default = """SELECT manufacture_difference_account FROM `tabItem Default` WHERE parent = %s and company = %s"""
    account = frappe.db.sql(query_item_default, (param, company), as_dict=True)

    if len(account) > 0 and account[0].manufacture_difference_account is not None:
        return account[0].manufacture_difference_account 
    
    return ""
    
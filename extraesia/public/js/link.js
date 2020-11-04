frappe.ui.form.ControlLink = frappe.ui.form.ControlLink.extend({
	validate_link_and_fetch: (df, doctype, docname, value) => {
        var me = this;
		if(value) {
			return new Promise((resolve) => {
				var fetch = '';
				if(this.frm && this.frm.fetch_dict[df.fieldname]) {
					fetch = this.frm.fetch_dict[df.fieldname].columns.join(', ');
                }

				return frappe.call({
					method:'frappe.desk.form.utils.validate_link',
					type: "GET",
					args: {
						'value': value,
						'options': doctype,
						'fetch': fetch
                    },
					no_spinner: true,
					callback: function(r) {
						if(r.message=='Ok') {
							if(r.fetch_values && docname) {
								me.set_fetch_values(df, docname, r.fetch_values);
                            }
                            set_diff_account(doctype, r.valid_value)
                            resolve(r.valid_value);
						} else {
							resolve("");
						}
					}
				});
			});
		}
    },
});

const set_diff_account = (doctype, value) => {
    var me = this;
    if (doctype != "Stock Entry Type" || me.cur_frm.doc.stock_entry_type == value)  {
        return
    }
    // const totalUpdated = (me.cur_frm.doc.items || []).filter(item => item.updated).length

    // if (totalUpdated > 0) {
    //     frappe.confirm('Do you want to replace all difference accounts?', 
    //         () => replace_account(value, me.cur_frm.doc.items), 
    //         () => replace_account(value, me.cur_frm.doc.items.filter(item => !item.updated))
    //     );
    // } else {
        replace_account(value, me.cur_frm.doc.items)
    // }  
}

const replace_account = (value, items) => {
    var me = this;
    switch (value) {
        case "Material Issue":
        case "Material Receipt":
            $.each(items, function (i, d) {
                d.expense_account = ""
                // d.updated = false
            });
            break
        case "Manufacture":
        case "Repack":
            var itemCodes = me.cur_frm.doc.items.map(item => item.item_code)
            me.cur_frm.call({
                method: "extraesia.accounts.utils.get_manufacture_account",
                args: {
                    item_codes: itemCodes
                },
                callback: function(r) {
                    $.each(items, function (i, d) {
                        d.expense_account = r.message[i]
                        // d.updated = false
                    });
                }
            });
            break
        default:
            if(me.cur_frm.doc.company && erpnext.is_perpetual_inventory_enabled(me.cur_frm.doc.company)) {
                me.cur_frm.call({
                    method: "erpnext.accounts.utils.get_company_default",
                    args: {
                        "fieldname": "stock_adjustment_account",
                        "company": me.cur_frm.doc.company
                    },
                    callback: function(r) {
                        if (!r.exc) {
                            $.each(items, function(i, d) {
                                if(!d.expense_account) {
                                    if(d.default_account) d.expense_account = d.default_account;
                                    else d.expense_account = r.message;
                                } else {
                                    d.expense_account = d.default_account || ""
                                }
                                // d.updated = false
                            });
                        }
                    }
                });
            }
    }

}
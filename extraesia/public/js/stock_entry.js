const findItemAccount = (message, item) => {
	let account = message[item.item_code]
    if (account == null) {
        account = message[item.item_group]
    }
    return account || "";
};

frappe.ui.form.on('Stock Entry Detail', {
    item_code: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
		if(d.item_code) {
			var args = {
				'item_code'			: d.item_code,
				'warehouse'			: cstr(d.s_warehouse) || cstr(d.t_warehouse),
				'transfer_qty'		: d.transfer_qty,
				'serial_no'		: d.serial_no,
                'bom_no'		: d.bom_no,
				'expense_account'	: d.expense_account,
				'cost_center'		: d.cost_center,
				'company'		: frm.doc.company,
				'qty'			: d.qty,
				'voucher_type'		: frm.doc.doctype,
				'voucher_no'		: d.name,
				'allow_zero_valuation': 1,
            };
            
			return frappe.call({
				doc: frm.doc,
				method: "get_item_details",
				args: args,
				callback: function(r) {
					if(r.message) {
                        var d = locals[cdt][cdn];
                        d.default_account = r.message.expense_account
                        // d.is_new = true
                        var stockEntryType = frm.doc.stock_entry_type
                        if (stockEntryType && stockEntryType != "") {
                            switch (stockEntryType) {
                                case "Material Issue":
                                case "Material Receipt":
                                    r.message.expense_account = ""
                                    d.expense_account = ""
                                    break
                                case "Manufacture":
                                case "Repack":
                                    var itemCodes = [d.item_code]
                                    me.frm.call({
                                        method: "extraesia.accounts.utils.get_manufacture_account",
                                        args: {
                                            item_codes: itemCodes
                                        },
                                        callback: function(r) {
                                            let account = findItemAccount(r.message, d)
                                            r.message.expense_account = account
                                            d.expense_account = account
                                        }
                                    });
                                    break
                            }
                        }

						$.each(r.message, function(k, v) {
							if (v) {
								frappe.model.set_value(cdt, cdn, k, v); // qty and it's subsequent fields weren't triggered
							}
                        });
                        refresh_field("items");
						if (!d.serial_no) {
							erpnext.stock.select_batch_and_serial_no(frm, d);
						}
					}
				}
			});
		}
	},
    expense_account: function(frm, cdt, cdn) {
        // var d = locals[cdt][cdn]
        // var stockEntryType = frm.doc.stock_entry_type
        // if (stockEntryType && stockEntryType != "") {
        //     if (d.item_code && d.item_code != "" && !d.is_new) {
        //         d.updated = true
        //     }
        //     d.is_new = false
        // }
        erpnext.utils.copy_value_in_all_rows(frm.doc, cdt, cdn, "items", "expense_account");
	},
});

erpnext.stock.StockEntry = erpnext.stock.StockEntry.extend({
    onload_post_render: function() {
		var me = this;

		this.set_account(function() {
			if(me.frm.doc.__islocal && me.frm.doc.company && !me.frm.doc.amended_from) {
				me.frm.trigger("company");
			}
		});

		this.frm.get_field("items").grid.set_multiple_add("item_code", "qty");
    },

    set_account: function(callback) {
        var me = this;
        var stockEntryType = me.frm.doc.stock_entry_type
        if (stockEntryType && stockEntryType != "") {
            $.each(me.frm.doc.items, function (i, d) {
                d.default_account = d.expense_account
            });
            this.set_custom_account(callback, stockEntryType)
        } else {
            this.set_default_account(callback, false)
        }
    },

    set_custom_account: function(callback, stockEntryType) {
        var me = this;
        switch (stockEntryType) {
            case "Material Issue":
            case "Material Receipt":
                $.each(me.frm.doc.items, function (i, d) {
                    d.expense_account = d.default_account || ""
                });
                break
            case "Manufacture":
            case "Repack":
                var itemCodes = me.frm.doc.items.map(item => item.item_code)
                me.frm.call({
                    method: "extraesia.accounts.utils.get_manufacture_account",
                    args: {
                        item_codes: itemCodes
                    },
                    callback: function(r) {
                        $.each(me.frm.doc.items, function (i, d) {
                            let account = findItemAccount(r.message, d)
                            d.expense_account = account
                        });
                    }
                });
                break
            default:
                this.set_default_account(callback, true)
        }
    },

    set_default_account: function(callback, is_redirect) {
        var me = this;

		if(this.frm.doc.company && erpnext.is_perpetual_inventory_enabled(this.frm.doc.company)) {
			return this.frm.call({
				method: "erpnext.accounts.utils.get_company_default",
				args: {
					"fieldname": "stock_adjustment_account",
					"company": this.frm.doc.company
				},
				callback: function(r) {
					if (!r.exc) {
						$.each(me.frm.doc.items || [], function(i, d) {
                            if(!d.expense_account) {
                                d.expense_account = r.message;
                                if (is_redirect && (d.default_account && d.default_account != "")) d.expense_account = d.default_account;
                            }
						});
						if(callback) callback();
					}
				}
			});
		}
    },
})

$.extend(this.frm.cscript, new erpnext.stock.StockEntry({frm: this.frm}));
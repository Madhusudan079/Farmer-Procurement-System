// Copyright (c) 2026, Madhusudan Sharma and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Farmer Registration", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("Farmer Registration", {
    validate(frm) {
        let today = frappe.datetime.get_today();

        if (frm.doc.registration_date !== today) {
            frappe.throw("Registration Date must be today's date");
        }
    }
});
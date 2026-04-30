// Copyright (c) 2026, Madhusudan Sharma and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Procurement Entry", {
// 	refresh(frm) {

// 	},
// });


frappe.ui.form.on("Gate Entry Item", {
    total_bag: function(frm, cdt, cdn) {
        update_total_bag(frm);
    },

    total_weight(frm, cdt, cdn) {
        update_total_bag(frm);
    }
    
});

function update_total_bag(frm) {
    let total = 0;
    let total_weight = 0;

    (frm.doc.gate_entry_item || []).forEach(row => {
        total += row.total_bag || 0;
        total_weight += row.total_weight || 0;
    });

    frm.set_value("total_bag", total);
    frm.set_value("total_weight", total_weight);
}
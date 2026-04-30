// Copyright (c) 2026, Madhusudan Sharma and contributors
// For license information, please see license.txt

frappe.ui.form.on("Weighment Entry", {

    procurement_ge(frm) {

        if (!frm.doc.procurement_ge) return;

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Procurement Entry",
                name: frm.doc.procurement_ge
            },
            callback: function(r) {

                if (r.message) {

                    // clear existing rows
                    frm.clear_table("item");

                    // loop through procurement child table
                    (r.message.gate_entry_item || []).forEach(row => {

                        let d = frm.add_child("item");

                        d.item = row.item;
                        d.bag_type = row.bag_type;
                        d.total_bag = row.total_bag;
                        d.total_weight = row.total_weight;
                        d.procurement_model = row.procurement_model;

                    });

                    frm.refresh_field("item");
                }
            }
        });
    },

    validate(frm) {
        // Validation: Tare Weight must be filled when moving to Tare Pending
        if (frm.doc.status === "Tare Pending" && !frm.doc.tare_weight) {
            frappe.throw("Tare Weight is required for Tare Pending status");
        }
    },

    refresh(frm) {
        console.log("current status:", frm.doc.status);
        frm.clear_custom_buttons();

        // Set initial status if no status is set and gross_weight exists
        if (!frm.doc.status && frm.doc.gross_weight) {
            frm.set_value("status", "Gross Pending");
            frm.save();
            return;
        }

        // ✅ GROSS COMPLETE BUTTON - Show when gross_weight is entered
        if (
            frm.doc.gross_weight &&
            !["Gross Complete", "Tare Pending", "Tare Complete"].includes(frm.doc.status)
        ) {
            frm.add_custom_button("Gross Complete", () => {
                if (frm.doc.gross_weight) {
                    frm.set_value("status", "Gross Complete").then(() => {
                        frm.save();
                    });
                } else {
                    frappe.msgprint("Please enter Gross Weight first");
                }
            });
        }

        // ✅ TARE PENDING BUTTON - Show in Gross Complete status
        if (frm.doc.status === "Gross Complete") {
            frm.add_custom_button("Start Tare Weighing", () => {
                if (!frm.doc.tare_weight) {
                    frappe.msgprint("Please enter Tare Weight first");
                    return;
                }
                frm.set_value("status", "Tare Pending").then(() => {
                    frm.save();
                });
            });
        }

        // ✅ TARE COMPLETE BUTTON - Show in Tare Pending status
        if (frm.doc.status === "Tare Pending") {
            frm.add_custom_button("Tare Complete", () => {
                if (!frm.doc.tare_weight) {
                    frappe.msgprint("Please enter Tare Weight first");
                    return;
                }
                
                // Validate tare weight before changing status
                if (frm.doc.gross_weight && frm.doc.tare_weight) {
                    let net = frm.doc.gross_weight - frm.doc.tare_weight;
                    if (net <= 0) {
                        frm.set_value("tare_weight", "");
                        frappe.msgprint("Tare Weight cannot be greater or equal to Gross Weight. Please enter a valid tare weight.");
                        return;
                    }
                    frm.set_value("net_weight", net);
                }
                
                frm.set_value("status", "Tare Complete").then(() => {
                    frm.save();
                });
            });
        }

        // Show status badge
        if (frm.doc.status) {
            frm.page.set_indicator(frm.doc.status, 
                ["Gross Pending"].includes(frm.doc.status) ? "orange" :
                ["Gross Complete"].includes(frm.doc.status) ? "yellow" :
                ["Tare Pending"].includes(frm.doc.status) ? "blue" :
                ["Tare Complete"].includes(frm.doc.status) ? "green" : "gray"
            );
        }
    },

    gross_weight(frm) {
        frm.trigger("refresh");
    },

    tare_weight(frm) {
        frm.trigger("refresh");
    }
});
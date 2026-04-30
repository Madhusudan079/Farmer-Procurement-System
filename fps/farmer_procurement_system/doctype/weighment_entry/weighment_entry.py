# Copyright (c) 2026, Madhusudan Sharma and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class WeighmentEntry(Document):
    def validate(self):
        """Validate document based on current status"""
        self.validate_gross_weight()
        self.validate_tare_weight()
        self.validate_workflow_requirements()

    def validate_gross_weight(self):
        """Validate gross weight is entered"""
        if not self.gross_weight:
            frappe.throw("Gross Weight is required")

    def validate_tare_weight(self):
        """Validate tare weight logic"""
        if self.status == "Tare Complete":
            if not self.tare_weight:
                frappe.throw("Tare Weight is required for Tare Complete status")
            
            if self.tare_weight >= self.gross_weight:
                self.tare_weight = None
                frappe.throw("Tare Weight cannot be greater or equal to Gross Weight")
            
            # Calculate net weight
            self.net_weight = self.gross_weight - self.tare_weight

    def validate_workflow_requirements(self):
        """Validate workflow requirements for each status"""
        if self.status == "Tare Pending":
            if not self.tare_weight:
                frappe.throw("Tare Weight must be entered before proceeding to Tare Pending")
    
def update_procurement_status(doc, method):
    """Hook function to update Procurement Entry status"""
    if doc.procurement_ge:
        frappe.db.set_value(
            "Procurement Entry",
            doc.procurement_ge,
            "status",
            doc.status
        )


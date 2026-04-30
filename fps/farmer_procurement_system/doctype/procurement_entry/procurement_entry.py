# Copyright (c) 2026, Madhusudan Sharma and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ProcurementEntry(Document):
	def after_insert(self):
		self.db_set("status", "Weighing")

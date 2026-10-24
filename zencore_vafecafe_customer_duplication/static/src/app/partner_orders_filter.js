import { patch } from "@web/core/utils/patch";
import { PartnerList } from "@point_of_sale/app/screens/partner_list/partner_list";
import { TicketScreen } from "@point_of_sale/app/screens/ticket_screen/ticket_screen";

/**
 * Patch PartnerList to pass selectedPartnerId in stateOverride when clicking 'All Orders'.
 */
patch(PartnerList.prototype, {
    goToOrders(partner) {
        this.clickPartner(this.props.partner);
        const partnerHasActiveOrders = this.pos
            .get_open_orders()
            .some((order) => (order.get_partner?.() || order.partner_id || order.partner)?.id === partner.id);
        const stateOverride = {
            search: {
                fieldName: "PARTNER",
                searchTerm: partner.name,
            },
            filter: partnerHasActiveOrders ? "" : "SYNCED",
            selectedPartnerId: partner.id,
        };
        this.props.close?.();
        this.pos.showScreen("TicketScreen", { stateOverride });
    },
});

/**
 * Patch TicketScreen to filter strictly by selectedPartnerId when present.
 */
patch(TicketScreen.prototype, {
    _computeSyncedOrdersDomain() {
        if (this.state.selectedPartnerId && this.state.search?.fieldName === "PARTNER") {
            return [["partner_id", "=", this.state.selectedPartnerId]];
        }
        return super._computeSyncedOrdersDomain(...arguments);
    },

    _getSearchFields() {
        const fields = super._getSearchFields(...arguments);
        if (this.state?.selectedPartnerId && fields?.PARTNER) {
            const originalRepr = fields.PARTNER.repr;
            fields.PARTNER = {
                ...fields.PARTNER,
                repr: (order) => {
                    const partner = order.get_partner ? order.get_partner() : (order.partner_id || order.partner);
                    if (partner?.id === this.state.selectedPartnerId) {
                        return originalRepr ? originalRepr(order) : (partner.name || "");
                    }
                    return "";
                },
            };
        }
        return fields;
    },

    getFilteredOrderList() {
        let orders = super.getFilteredOrderList(...arguments);
        if (this.state?.selectedPartnerId && this.state.search?.fieldName === "PARTNER") {
            orders = orders.filter((order) => {
                const partner = order.get_partner ? order.get_partner() : (order.partner_id || order.partner);
                return partner?.id === this.state.selectedPartnerId;
            });
        }
        return orders;
    },

    async onSearch(search) {
        if (this.state.selectedPartnerId) {
            if (search.fieldName !== "PARTNER" || search.searchTerm !== this.state.search?.searchTerm) {
                this.state.selectedPartnerId = null;
            }
        }
        return super.onSearch(...arguments);
    },
});

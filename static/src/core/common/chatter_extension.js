/* @odoo-module */

import { patch } from "@web/core/utils/patch";
import { Chatter } from "@mail/core/web/chatter";
import { _t } from "@web/core/l10n/translation";

const originalToggleComposer = Chatter.prototype.toggleComposer;

patch(Chatter.prototype, {
    async toggleComposer(type) {
        if (type === 'message') {
            // First switch back to chat history view if we're in website requests
            if (this.state.composerType === 'website') {
                this.state.composerType = null;
            }
            
            // Create the same context and action as the full composer
            const context = {
                default_email_layout_xmlid: 'mail_template_modern.mail_templates_modern_layout',
                default_model: this.state.thread.model,
                default_res_ids: [this.state.thread.id],
                default_subtype_xmlid: 'mail.mt_comment',
                mail_post_autofollow: this.state.thread.hasWriteAccess,
            };
            
            const action = {
                name: _t("Compose Email"),
                type: "ir.actions.act_window",
                res_model: "mail.compose.message",
                view_mode: "form",
                views: [[false, "form"]],
                target: "new",
                context: context,
            };

            await this.env.services.action.doAction(action, {
                onClose: () => {
                    if (this.state.thread) {
                        this.threadService.fetchNewMessages(this.state.thread);
                    }
                },
            });
            return;
        }
        // For other types (like notes), keep original behavior
        return originalToggleComposer.call(this, type);
    },
});
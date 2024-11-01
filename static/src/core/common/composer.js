/* @odoo-module */

/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import { Composer } from "@mail/core/common/composer";  
import { prettifyMessageContent } from "@mail/utils/common/format";
import { _t } from "@web/core/l10n/translation";

patch(Composer.prototype, {
    setup() {
        super.setup();  // Call parent class setup
    },  

    async onClickFullComposer(ev) {
        if (this.props.type !== "note") {
            // auto-create partners of checked suggested partners
            const newPartners = this.thread.suggestedRecipients.filter(
                (recipient) => recipient.checked && !recipient.persona
            );
            if (newPartners.length !== 0) {
                const recipientEmails = [];
                const recipientAdditionalValues = {};
                newPartners.forEach((recipient) => {
                    recipientEmails.push(recipient.email);
                    recipientAdditionalValues[recipient.email] =
                        recipient.defaultCreateValues || {};
                });
                const partners = await this.rpc("/mail/partner/from_email", {
                    emails: recipientEmails,
                    additional_values: recipientAdditionalValues,
                });
                for (const index in partners) {
                    const partnerData = partners[index];
                    const persona = this.store.Persona.insert({ ...partnerData, type: "partner" });
                    const email = recipientEmails[index];
                    const recipient = this.thread.suggestedRecipients.find(
                        (recipient) => recipient.email === email
                    );
                    Object.assign(recipient, { persona });
                }
            }
        }
        const attachmentIds = this.props.composer.attachments.map((attachment) => attachment.id);
        const body = this.props.composer.textInputContent;
        const validMentions = this.store.user
            ? this.messageService.getMentionsFromText(body, {
                  mentionedChannels: this.props.composer.mentionedChannels,
                  mentionedPartners: this.props.composer.mentionedPartners,
              })
            : undefined;
            const context = {
                default_email_layout_xmlid: 'mail_template_modern.mail_templates_modern_layout',
                default_attachment_ids: attachmentIds,
                default_body: await prettifyMessageContent(body, validMentions),
                default_model: this.thread.model,
                default_partner_ids: this.props.type === "note" ? [] : this.thread.suggestedRecipients
                    .filter(recipient => recipient.checked)
                    .map(recipient => recipient.persona.id),
                default_res_ids: [this.thread.id],
                default_subtype_xmlid: this.props.type === "note" ? "mail.mt_note" : "mail.mt_comment",
                mail_post_autofollow: this.thread.hasWriteAccess,
            };
            
        const action = {
            name: this.props.type === "note" ? _t("Log note") : _t("Compose Email"),
            type: "ir.actions.act_window",
            res_model: "mail.compose.message",
            view_mode: "form",
            views: [[false, "form"]],
            target: "new",
            context: context,
        };
        const options = {
            onClose: (...args) => {
                // args === [] : click on 'X'
                // args === { special: true } : click on 'discard'
                const isDiscard = args.length === 0 || args[0]?.special;
                // otherwise message is posted (args === [undefined])
                if (!isDiscard && this.props.composer.thread.type === "mailbox") {
                    this.notifySendFromMailbox();
                }
                this.clear();
                this.props.messageToReplyTo?.cancel();
                if (this.thread) {
                    this.threadService.fetchNewMessages(this.thread);
                }
            },
        };
        await this.env.services.action.doAction(action, options);
    },
});
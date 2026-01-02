const { Telegraf } = require("telegraf");
const axios = require("axios");
const QRCode = require("qrcode");
const fs = require("fs");

const bot = new Telegraf(process.env.BOT_TOKEN);

// MAIN OWNER
const MAIN_OWNER = 6245574035;
let owners = [MAIN_OWNER];

const warnings = {};
const linkRegex = /(https?:\/\/|t\.me|telegram\.me|wa\.me|www\.)/i;

// Check owner
function isOwner(id) {
  return owners.includes(id);
}

// Check admin
async function isAdmin(ctx, id) {
  try {
    const admins = await ctx.getChatAdministrators();
    return admins.some(a => a.user.id === id);
  } catch {
    return false;
  }
}

// START
bot.start(ctx => {
  ctx.reply("🌊 Aqua Anti-Link Bot Active!\n\nCommands:\n/qr\n/zip\n/owner\n/addev\n/send");
});

// OWNER
bot.command("owner", async ctx => {
  try {
    const user = await ctx.telegram.getChat(MAIN_OWNER);
    ctx.reply(`👑 Owner: ${user.first_name}\n🔗 @${user.username}\n🆔 ${MAIN_OWNER}`);
  } catch {
    ctx.reply(`👑 Owner ID: ${MAIN_OWNER}`);
  }
});

// ADD OWNER
bot.command("addev", ctx => {
  if (!isOwner(ctx.from.id)) return;
  if (!ctx.message.reply_to_message) return ctx.reply("Reply to a user");

  const id = ctx.message.reply_to_message.from.id;
  if (!owners.includes(id)) {
    owners.push(id);
    ctx.reply("✅ Added as owner");
  }
});

// QR
bot.command("qr", async ctx => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Give text");

  const qr = await QRCode.toBuffer(text);
  ctx.replyWithPhoto({ source: qr });
});

// ZIP
bot.command("zip", async ctx => {
  const url = ctx.message.text.split(" ")[1];
  if (!url) return ctx.reply("Give file URL");

  const res = await axios.get(url, { responseType: "stream" });
  const file = "file.zip";

  res.data.pipe(fs.createWriteStream(file)).on("finish", () => {
    ctx.replyWithDocument({ source: file });
  });
});

// BROADCAST
bot.command("send", ctx => {
  if (!isOwner(ctx.from.id)) return;
  ctx.reply("Send message or media to broadcast");

  bot.once("message", async m => {
    try {
      await ctx.telegram.copyMessage(
        ctx.chat.id,
        m.chat.id,
        m.message_id
      );
    } catch {}
  });
});

// 🔥 ANTI-LINK SYSTEM
bot.on("message", async ctx => {
  if (!ctx.chat || ctx.chat.type === "private") return;
  if (!ctx.message.text) return;
  if (await isAdmin(ctx, ctx.from.id)) return;

  if (linkRegex.test(ctx.message.text)) {
    try { await ctx.deleteMessage(); } catch {}

    const key = `${ctx.chat.id}_${ctx.from.id}`;
    warnings[key] = (warnings[key] || 0) + 1;

    if (warnings[key] >= 3) {
      await ctx.reply(`🚫 ${ctx.from.first_name} banned (3 warnings)`);
      try { await ctx.banChatMember(ctx.from.id); } catch {}
      delete warnings[key];
    } else {
      await ctx.reply(`⚠️ No links!\nWarning ${warnings[key]}/3`);
    }
  }
});

bot.launch();
console.log("🌊 Aqua Anti-Link Bot running");
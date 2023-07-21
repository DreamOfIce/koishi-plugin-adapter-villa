import { type Dict, type Element, h } from "koishi";
import { Message } from "../structs";

const postPrefix = "https://www.miyoushe.com/dby/article/";

const emojiRegExp =
  /\[([\p{Unified_Ideograph}A-z0-9][\p{Unified_Ideograph}\w ]+[\p{Unified_Ideograph}A-z0-9])\]/gu;

const inlineAttrEntityTypes: Message.TextEntity["entity"]["type"][] = [
  "mentioned_robot",
  "mentioned_user",
  "mentioned_all",
  "villa_room_link",
];

const preProcessingEntities = (entities: Message.TextEntity[]) => {
  const inlineAttrEntities = entities.filter((e) =>
    inlineAttrEntityTypes.includes(e.entity.type)
  );
  return entities
    .sort((e1, e2) => e1.offset - e2.offset || e1.length - e2.length)
    .flatMap((e) => {
      if (inlineAttrEntityTypes.includes(e.entity.type)) {
        return [e];
      } else {
        return inlineAttrEntities.reduce(
          (acc, e1) => {
            acc.forEach((e2) => {
              // e2 start before e1 and end in e1
              if (
                e2.offset < e1.offset &&
                e2.offset + e2.length > e1.offset &&
                e2.offset + e2.length < e1.offset + e1.length
              )
                e2.length = e1.offset - e2.offset;
              // e2 start in e1 and end after e1
              else if (
                e2.offset > e1.offset &&
                e2.offset < e1.offset + e1.length &&
                e2.offset + e2.length > e1.offset + e1.length
              )
                e2.offset = e1.offset + e1.length;
            });
            return acc;
          },
          [e]
        );
      }
    });
};

const addEndTag = ({
  elementsStr,
  entity,
}: {
  elementsStr: string;
  entity: Message.TextEntity;
}) => {
  let tagName = "";
  switch (entity.entity.type) {
    case "mentioned_robot":
    case "mentioned_user":
    case "mentioned_all":
      tagName = "at";
      break;
    case "villa_room_link":
      tagName = "sharp";
      break;
    case "link":
      tagName = "a";
      break;
  }
  elementsStr += `</${tagName}>`;
};

export const parseMessage = (
  type: Message.MessageNumberType,
  msg: Message.MsgContentInfo
): Element[] => {
  const elements: Element[] = [];
  if (msg.quote)
    elements.push(
      h("quote", {
        id: `${msg.quote.quoted_message_id}~${msg.quote.quoted_message_send_time}`,
      })
    );

  switch (type) {
    case Message.MessageNumberType.text:
      elements.push(
        ...parseTextMessageContent(msg.content as Message.TextMsgContent)
      );
      break;
    case Message.MessageNumberType.image:
      elements.push(
        ...parseImageMessageContent(msg.content as Message.ImageMsgContent)
      );
      break;
    case Message.MessageNumberType.post:
      elements.push(
        ...parsePostMessageContent(msg.content as Message.PostMsgContent)
      );
      break;
  }

  return elements;
};

/**
 * Parse message of type "MHY:Text"
 * @param content message content
 * @returns Koishi elements array
 */
export const parseTextMessageContent = (
  content: Message.TextMsgContent
): Element[] => {
  let elementsStr = "";
  let i = 0;

  const { text } = content;
  const entities = preProcessingEntities(content.entities);

  let unclosedElements: Message.TextEntity[] = [];

  for (; i < text.length; i++) {
    unclosedElements = unclosedElements.filter((entity) => {
      if (entity.offset === i - 1) {
        addEndTag({ elementsStr, entity });
        return false;
      } else {
        return true;
      }
    });

    for (const entity of entities.filter((e) => e.offset === i)) {
      switch (entity.entity.type) {
        case "mentioned_robot": {
          const name = text
            .slice(entity.offset, entity.offset + entity.length)
            .trim();
          elementsStr += `<at id="${h.escape(
            entity.entity.bot_id,
            true
          )}" name="${h.escape(
            name.startsWith("@") ? name.slice(1) : name,
            true
          )}" />`;
          i += entity.length;
          break;
        }
        case "mentioned_user": {
          const name = text
            .slice(entity.offset, entity.offset + entity.length)
            .trim();
          elementsStr += `<at id="${h.escape(
            entity.entity.user_id,
            true
          )}" name="${h.escape(
            name.startsWith("@") ? name.slice(1) : name,
            true
          )}" />`;
          i += entity.length;
          break;
        }
        case "mentioned_all": {
          const name = text
            .slice(entity.offset, entity.offset + entity.length)
            .trim();
          elementsStr += `<at type="all" name="${h.escape(
            name.startsWith("@") ? name.slice(1) : name,
            true
          )}" />`;
          i += entity.length;
          break;
        }
        case "villa_room_link": {
          elementsStr += `<sharp id="${h.escape(
            `${entity.entity.villa_id}~${entity.entity.room_id}`,
            true
          )}" name="${h.escape(
            text.slice(entity.offset, entity.length),
            true
          )}" />`;
          i += entity.length;
          break;
        }
        case "link": {
          elementsStr += `<a href="${h.escape(entity.entity.url)}">`;
          unclosedElements.unshift(entity);
          break;
        }
        default:
          continue;
      }
      break;
    }
    elementsStr += h.escape(text[i]!);
  }

  // replace emojis
  const elements = h.transform(h.parse(elementsStr), {
    text: (attrs: Dict<string, "content">) =>
      h.parse(
        h
          .escape(attrs.content)
          .replace(
            emojiRegExp,
            (_match, name: string) =>
              `<face id="${h.escape(name, true)}" name="${h.escape(
                name,
                true
              )}" platform="villa" />`
          )
      ),
  });

  return elements;
};

/**
 * Parse message of type "MHY:Image"
 * @param content message content
 * @returns Koishi elements array
 */
export const parseImageMessageContent = (
  content: Message.ImageMsgContent
): Element[] => [h("image", { url: content.url })];

/**
 * Parse message of type "MHY:Post"
 * @param content message content
 * @returns Koishi elements array
 */
export const parsePostMessageContent = (
  content: Message.PostMsgContent
): Element[] => [h("a", { href: `${postPrefix}${content.post_id}` })];

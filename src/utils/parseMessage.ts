import { type Dict, type Element, h } from "koishi";
import { Callback, Message } from "../structs";

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
        let entity = [e];
        inlineAttrEntities.forEach((e1) => {
          entity = entity.map((e2) => {
            // e2 start before e1 and end in e1
            if (
              e2.offset < e1.offset &&
              e2.offset + e2.length > e1.offset &&
              e2.offset + e2.length < e1.offset + e1.length
            )
              return {
                ...e2,
                length: e1.offset - e2.offset,
              };
            // e2 start in e1 and end after e1
            else if (
              e2.offset > e1.offset &&
              e2.offset < e1.offset + e1.length &&
              e2.offset + e2.length > e1.offset + e1.length
            )
              return {
                ...e2,
                offset: e1.offset + e1.length,
              };
            else return e2;
          });
        });
        return entity;
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
  type: Callback.MessageNumberType,
  msg: Message.MsgContentInfo
): Element[] => {
  switch (type) {
    case Callback.MessageNumberType.text:
      return parseTextMessage(
        msg as Message.MsgContentInfo<Message.TextMsgContent>
      );
    case Callback.MessageNumberType.image:
      return parseImageMessage(
        msg as Message.MsgContentInfo<Message.ImageMsgContent>
      );
  }
};

/**
 * Parse message of type "MHY:Text"
 * @param msg message content
 * @returns Koishi elements array
 */
export const parseTextMessage = (
  msg: Message.MsgContentInfo<Message.TextMsgContent>
): Element[] => {
  let elementsStr = "";
  let i = 0;

  const { text } = msg.content;
  const entities = preProcessingEntities(msg.content.entities);

  let unclosedElements: Message.TextEntity[] = [];

  for (; i < text.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const c = text[i]!;
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
          const name = text.slice(entity.offset, entity.offset + entity.length);
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
          const name = text.slice(entity.offset, entity.offset + entity.length);
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
          const name = text.slice(entity.offset, entity.offset + entity.length);
          elementsStr += `<at type="all" name="${h.escape(
            name.startsWith("@") ? name.slice(1) : name,
            true
          )}" />`;
          i += entity.length;
          break;
        }
        case "villa_room_link": {
          elementsStr += `<sharp id="${h.escape(
            entity.entity.room_id,
            true
          )}" guild="${h.escape(
            entity.entity.villa_id,
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
          elementsStr += h.escape(c);
          break;
        }
      }
    }
  }

  // replace emojis
  const elements = h.transform(h.parse(elementsStr), {
    text: (attrs: Dict<string, "content">) =>
      h.parse(
        attrs.content.replace(
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
 * @param msg message content
 * @returns Koishi elements array
 */
export const parseImageMessage = (
  msg: Message.MsgContentInfo<Message.ImageMsgContent>
): Element[] => [h("image", { url: msg.content.url })];

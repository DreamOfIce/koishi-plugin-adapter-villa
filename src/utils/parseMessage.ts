import { type Dict, type Element, h } from "koishi";
import { Message } from "../structs";

const emojiRegExp =
  /\[([\p{Unified_Ideograph}A-z0-9][\p{Unified_Ideograph}\w ]+[\p{Unified_Ideograph}A-z0-9])\]/gu;

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

export const parseMessage = (msg: Message.MsgContentInfo): Element[] => {
  let elementsStr = "";
  let i = 0;

  const { text } = msg.content;
  const entities = msg.content.entities.sort(
    (e1, e2) => e1.offset - e2.offset || e1.length - e2.length
  );
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
          // Close all unclosed elements
          unclosedElements.forEach((entity) =>
            addEndTag({ elementsStr, entity })
          );

          // Add <at> element
          // Note that the next content will be used as the plain text attr `name`
          elementsStr += `<at id="${h.escape(
            entity.entity.bot_id,
            true
          )}" name="${h.escape(
            name.startsWith("@") ? name.slice(1) : name,
            true
          )}" />`;
          i += entity.length;

          // Reopen the unfinished elements
          unclosedElements = unclosedElements.filter((e) => {
            if (e.offset + e.length > i) {
              switch (e.entity.type) {
                case "link": {
                  elementsStr += `<a href="${h.escape(e.entity.url)}">`;
                  elementsStr += h.escape(c);
                  break;
                }
              }
              return true;
            } else {
              return false;
            }
          });
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

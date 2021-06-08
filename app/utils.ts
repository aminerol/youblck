import { filter, isEmpty } from "lodash";

export async function getChannelInfo(channelId) {
  try {
    const response = await fetch(
      `https://m.youtube.com/results?sp=mAEA&search_query=${channelId}&pbj=1`,
      {
        method: "POST",
      }
    );
    var json = await response.json();
    if (json != null) {
      const contents =
        json.response.contents.sectionListRenderer.contents[0]
          .itemSectionRenderer.contents;
      let channel = filter(contents, "compactChannelRenderer")[0];
      if (!isEmpty(channel)) {
        channel = channel.compactChannelRenderer;
        return Promise.resolve({
          videoCount: channel.videoCountText.runs[0].text,
          subscriberCount: channel.subscriberCountText.runs[0].text,
        });
      } else return Promise.resolve({});
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

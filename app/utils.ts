import { filter, isEmpty } from "lodash";
import millify from "millify";

const API_KEY = "AIzaSyDCU8hByM-4DrUqRUYnGn-3llEO78bcxq8";

export async function getChannelInfo(channelId: string, config: any) {
  const response = await getChannelInfoInnerAPI(channelId, config);
  if (response) return response;
  return getChannelInfoAPI(channelId);
}

async function getChannelInfoInnerAPI(channelId: string, config: any) {
  try {
    const response = await fetch(
      `https://m.youtube.com/results?sp=mAEA&search_query=${channelId}&pbj=1`,
      {
        method: "POST",
        headers: new Headers({
          "User-Agent": config.userAgent,
          "Content-Type": "application/json",
          "X-GOOG-API-FORMAT-VERSION": config.clientVersion,
          "X-Goog-Visitor-Id": config.visitorData,
        }),
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
          videoCount: channel.videoCountText.runs[0].text + " videos",
          subscriberCount: channel.subscriberCountText.runs[0].text,
        });
      } else return Promise.resolve();
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getChannelInfoAPI(channelId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,id&id=${channelId}&key=${API_KEY}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    var json = await response.json();
    if (json != null) {
      const statistics = json.items[0].statistics;
      if (!isEmpty(statistics)) {
        return Promise.resolve({
          videoCount: millify(statistics.videoCount) + " videos",
          subscriberCount:
            !statistics.hiddenSubscriberCount &&
            millify(statistics.subscriberCount) + " subscribers",
        });
      } else return Promise.resolve([]);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

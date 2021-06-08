export interface StorageInterface {
  filterData: {
    videoId?: any[];
    channelId?: any[];
    channelName?: any[];
    title?: any[];
    comment?: any[];
  };
  options: {
    trending: boolean;
    mixes: boolean;
    suggestions_only: boolean;
    autoplay?: boolean;
    block_message?: string;
  };
}

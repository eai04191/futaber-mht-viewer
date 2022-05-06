# [futaber で保存した MHT を読むやつ](https://eai04191.github.io/futaber-mht-viewer/)

html と css と jpg が入ってるような MHT なら大体処理できる気がするけど、いまどき MHT なんて使わないので知らん

作成された添付ファイルの URL（`blob:`で始まる URL）は MHT ファイルの中に対する参照なので他の人に共有しても見れないことに注意

雑な実装で MHT ファイルを一気に読み込んで処理してるからめっちゃでかいと死ぬかも。200MB のなら問題なかったけど低スペだと死ぬかも

## License

MIT License

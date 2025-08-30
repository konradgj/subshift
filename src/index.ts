import { parseSrt } from "./core/parser";

const test: string = `1
00:00:13,681 --> 00:00:18,161
だって可能性感じたんだ

2
00:00:18,339 --> 00:00:22,801
そうだ… ススメ!

3
00:00:23,222 --> 00:00:25,852
後悔したくない

4
00:00:26,019 --> 00:00:32,617
目の前に僕らの道がある

5
00:00:34,478 --> 00:00:39,039
Let’s go! Do! I do! I live!

6
00:00:39,137 --> 00:00:43,463
Yes Do! I do! I live!`;

const parsed = parseSrt(test);
parsed.fileName = "test.srt";
parsed.filePath = "/path/to/test.srt";
parsed.format = "srt";
console.log(parsed);

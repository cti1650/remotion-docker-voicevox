# プレゼンター の素材クレジット

## 出典

- 名称: Avataaars
- 作者: Pablo Stanley (https://avataaars.com/)
- 取得元: DiceBear (https://www.dicebear.com/styles/avataaars/) の API
- リファレンス実装: https://github.com/fangpenlin/avataaars

## ライセンス

作者による表記は「Free for personal and commercial use」。
リファレンス実装 (fangpenlin/avataaars) は **MIT License** で公開されており、
再配布が明示的に許可されている。本リポジトリはそのライセンス表記を下記に同梱した上で
パーツをコミットしている。

```
MIT License

Copyright (c) 2017 Pablo Stanley, Fang-Pen Lin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 再生成

```bash
python3 scripts/fetch-avataaars-parts.py --name presenter
```

見た目（髪型・服・肌の色）はスクリプトの `APPEARANCE` で変えられる。

# Character Roster

`2026年4月15日` 時点で確認した、OshiClaw のキャラ候補台帳です。  
まずは `画像素材 / fallback` で増やし、公式 Live2D や VTubeStudio データを入手できたものから `model` に上げる前提です。

## 運用ルール

- `公式無料`
  - 公式サイトや公式ガイドラインがあり、個人の非商用公開デモと相性がよい枠
- `ローカルモデル`
  - この repo に同梱済みの Live2D モデルを使う枠
- `オリジナル`
  - OshiClaw 側で独自に持つキャラ枠
- `二次創作実験`
  - 公式ガイドラインはあるが、素材作者ごとの規約確認が別途必要な枠

## いま入れている roster

| id | name | group | visual | note |
| --- | --- | --- | --- | --- |
| `zundamon` | ずんだもん | 公式無料 | 画像素材 | 既定キャラ。公式 Live2D 入手時に切替候補 |
| `metan` | 四国めたん | 公式無料 | 画像素材 | ログ整理や戦略寄りキャラ |
| `sora` | 九州そら | 公式無料 | 画像素材 | 観測・記録寄りキャラ |
| `tsumugi` | 春日部つむぎ | 公式無料 | 画像素材 | 実務派メンター枠 |
| `hau` | 雨晴はう | 公式無料 | 画像素材 | やさしい案内役 |
| `ryusei` | 青山龍星 | 公式無料 | 画像素材 | クール男枠 |
| `takehiro` | 玄野武宏 | 公式無料 | 画像素材 | 兄貴分枠 |
| `himari` | 冥鳴ひまり | 公式無料 | 画像素材 | 静かな観測者枠 |
| `mio` | みお | ローカルモデル | Live2D | repo 同梱モデル |
| `buddy` | ハル | オリジナル | fallback | 同期の相棒 |
| `kurose` | 黒瀬 | オリジナル | fallback | 先輩エンジニア |
| `yukkuri_reimu` | ゆっくり霊夢 | 二次創作実験 | 自作 fallback | 外部素材は未同梱 |

## 公式寄りの出典

- 東北ずん子・ずんだもんPJ
  - ずんだもん / 四国めたん / 九州そら
  - 公式サイト: https://zunko.jp/
  - キャラクター利用ガイドライン: https://zunko.jp/guideline.html
- 春日部つむぎ
  - 公式HP: https://tsumugi-official.studio.site/top
  - 旧サイトの案内ページ: https://tsukushinyoki10.wixsite.com/ktsumugiofficial/about
  - VOICEVOX 商品ページ: https://voicevox.hiroshiba.jp/product/kasukabe_tsumugi/
- 雨晴はう
  - 公式サイト: https://amehau.com/
  - 利用規約: https://amehau.com/rules/amehare-hau-rule.html
  - VOICEVOX 商品ページ: https://voicevox.hiroshiba.jp/product/amehare_hau/
- 冥鳴ひまり
  - 公式サイト: https://www.meimeihimari.com/
  - 利用規約: https://www.meimeihimari.com/terms-of-use
  - VOICEVOX 商品ページ: https://voicevox.hiroshiba.jp/product/meimei_himari/
- VirVox Project
  - 青山龍星: https://www.virvoxproject.com/%E9%9D%92%E5%B1%B1%E9%BE%8D%E6%98%9F
  - 玄野武宏: https://www.virvoxproject.com/%E7%8E%84%E9%87%8E%E6%AD%A6%E5%AE%8F
  - 公式イラスト利用ガイドライン: https://www.virvoxproject.com/%E5%85%AC%E5%BC%8F%E3%82%A4%E3%83%A9%E3%82%B9%E3%83%88%E5%88%A9%E7%94%A8%E3%82%AC%E3%82%A4%E3%83%89%E3%83%A9%E3%82%A4%E3%83%B3

## 二次創作実験の出典

- 東方Project 二次創作ガイドライン
  - https://touhou-project.news/guideline/

## 実装メモ

- `characters/*.yaml` の `catalog` に `group_label / visual_label / source_label / source_url / license_note / note` を持たせる
- `live2d.model_url` が空なら fallback 表示に落とす
- 外部画像素材を repo に入れる前に、その素材ページ単位の規約を確認する
- `ゆっくり` 系は、東方ガイドラインに加えて素材作者ごとの規約確認が必要

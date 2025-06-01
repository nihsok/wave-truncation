# 全球スペクトルモデルにおける切断波数と格子点数との関係

## 変数の定義
- a: 半径（地球の場合約6371.2km、扁平率は0）
- I: 東西方向の格子点数
- J: 南北方向の格子点数
- N: 切断波数

水平スペクトル、球面調和関数、Legendre関数とは：https://www.gfd-dennou.org/arch/dcpam/dcpam4/dcpam4_current/doc/discretization/htm/node2.htm#tex2html2
## 格子点数から切断波数を計算する方法
格子点数と切断波数とは理論的な制約により決められる。
1. 波数切断方法を選択（三角形切断T or 平行四辺形切断R）
2. FFTのかけやすい東西格子点数を選ぶ → $I$
3. 東西波数の最大値を決める
    1. 非線形モデルの場合、$M=[\frac{I-1}{3}]$
    2. 線形モデルの場合、$M=[\frac{I}{2}]$、ただし [ ] はそれを超えない最大の整数
4. 最大全波数Nを決める
    1. 三角形切断なら $N=M$
    2. 平行四辺形切断なら $N=2M$
5. 南北格子点数 $J\ge\frac{3N+1}{2}$ を決める（偶数にする）

理論（数式）による記述は以下の資料が詳しい：https://www.gfd-dennou.org/library/dcpam/dcpam4/dcpam4-20071012/doc/discretization/htm/node6.htm#SECTION006820000000000000000

三角形切断、平行四辺形切断、それ以外の切断方法については：https://www.gfd-dennou.org/library/dcpam/dcpam4/dcpam4-20071012/doc/discretization/htm/node6.htm#SECTION006810000000000000000

セミラグランジュ法を採用すると、2/3の切断波数で同じ解像度を実現できる。このときガウス格子がLinearであることからTLと表記する：気象庁予報技術研修テキスト https://www.jma.go.jp/jma/kishou/books/nwptext/45/1_chapter4.pdf

2次格子では、上記の1次格子と比較して格子数はさらに1.5倍になる。QuadraticからTQ：
https://www.jma.go.jp/jma/kishou/books/npdc/r03/npdc_annual_report_r03_4-01.pdf
## 切断波数から（おおよその）格子点数を求める方法
上記と逆の手順になるが「FFTのかけやすい格子点数」は状況により異なる。

例として、デモでは2, 3, 5のみで素因数分解できる数を探索している（数字が大きいと実装から大きくずれる可能性あり）

## 主要な切断波数の例

|切断波数|I|$\Delta\theta$|$\Delta x$（赤道）|$\Delta x$（南北緯30度）|$\Delta x$（南北緯60度）|
---|---|---|---|---|---|
|T42|128|2.8125&deg;|313km|271km|156km|
|T62,T63|192|1.875&deg;|209km|181km|104km|
|T85|256|1.40625&deg;|156km|135km|78km|
|T106 TL159|320|1.125&deg;|125km|108km|63km|
|T169 TL255|512|0.703125&deg;|78km|68km|39km|
|T213 TL319|640|0.5625&deg;|63km|54km|31km|
|T319,TL479|960|0.375&deg;|42km|36km|21km|
|T382|1152|0.3125&deg;|35km|30km|17km|
|T574|1728|0.20833&deg;|23km|20km|12km|
|T639,TL959|1920|0.1875&deg;|21km|18km|10km|
|T1279|3840|0.09375&deg;|10km|9km|5km|
|T2047|6144|0.0586&deg;|6.5km|5.6km|3.3km|

こういった表は上記予報技術研修テキストや https://www.hysk.sakura.ne.jp/data_list/Reanalysis など

# Cubed sphere格子の場合
6面を構成するそれぞれの正方形（がゆがんだもの）をNExNEに分割する (NE: Number of Elements in each coordinate direction; [Lauritzen et al., 2018](https://doi.org/10.1029/2017MS001257))

さらに、それぞれのセルごとに基底関数を用いて離散化を行う。CESM/CAM-SEでは3次のGaussian quadrature（求積点は 4x4: np4）が使われる。グリッド配置は等間隔ではないが重み付けなので、ここでは単純に3分割されていると考える（近似）

- 格子点間隔が最も大きいのは赤道等の大円を分割するときで、$L_{max}=2\pi a/(4NE\times3)$

- 格子点間隔が最も小さいのは六面体の各辺を分割するときで、この辺は$\cos\theta$=1/3なる角（約70.5度）をなすので、$L_{min}=a\cos^{-1}(1/3)/(NE\times3)$

- 格子間隔を一様にするための修正が行われている場合、求積点の数=分割後のセルの数=$6\times9NE^2$
    - 求積点ひとつあたりが代表する平均的な面積は表面積を割り$A_{ave}=\frac{4\pi a^2}{54NE^2}$
    - これと等価なグリッドの長さをその平方根 $L_{ave}=\frac{2a}{3NE}\sqrt\frac{\pi}{6}$

それぞれの格子間隔は角度で表すこともできる（必ずしも経緯線と並行ではない）。$\Delta\theta=360^\circ\times L/2\pi a$

## 主要な分割数における格子間隔の例

||$L_{min}$|$\Delta\theta_{min}$|$L_{max}$|$\Delta\theta_{max}$|$L_{ave}$|$\Delta\theta_{ave}$|$A_{ave}$|
|---|---|---|---|---|---|---|---|
|ne16np4|163.6km|1.47&deg;|208.7km|1.88&deg;|192.3km|1.73&deg;|36978.1km<sup>2</sup>|
|ne30np4 (~one degree)|87.2km|0.78&deg;|111.3km|1&deg;|102.6km|0.92&deg;|10518.2km<sup>2</sup>|
|ne60np4|43.6km|0.39&deg;|55.7km|0.5&deg;|51.3km|0.46&deg;|2629.6km<sup>2</sup>|
|ne120np4 (~quarter degree)|21.8km|0.2&deg;|27.8km|0.25&deg;|25.6km|0.23&deg;|657.4km<sup>2</sup>|
|ne240np4|10.9km|0.1&deg;|13.9km|0.13&deg;|12.8km|0.12&deg;|164.3km<sup>2</sup>|
|n|$\frac{a}{3n}\cos^{-1}(\frac{1}{3})$|$\frac{60}{n\pi}\cos^{-1}(\frac{1}{3})$|$\frac{2\pi a}{12n}$|$\frac{30}{n}$|$\frac{2a}{3n}\sqrt{\frac{\pi}{6}}$|$\frac{20}{n}\sqrt{\frac{6}{\pi}}$|$\frac{2\pi a^2}{27n^2}$|

（Lauritzen et al., 2018 では$L_{max}$に対応する値が示されていると思われる）

# 正二十面体 (Icosahedral) 格子の場合
解像度は grid level ([Stuhne and Peltier, 1999](https://doi.org/10.1006/jcph.1998.6119)) あるいは grid division level (glevel; [Sato et al., 2008](https://doi.org/10.1016/j.jcp.2007.02.006)) で定義される。（この定義は [Thuburn (1997)](https://doi.org/10.1175/1520-0493(1997)125%3C2328:APBSWM%3E2.0.CO;2) とはひとつずれている）
- glevel-0のときは正二十面体に対応
- glevelひとつ増加ごとに各面の三角形を四分割するので、glevel-nのとき三角形の頂点の数（＝五角形or六角形のコントロールボリュームの数）は $N_c=10\times2^{2n}+2$

格子間隔は、
- 単純に赤道で考えると、glevel-nのとき$10\times2^{n-1}$個に分割されるので $L_{eq}=\frac{2\pi a}{10\times2^{n-1}}$
（[Tomita et al., 2002](https://doi.org/10.1006/jcph.2002.7193); [Miura and Kimoto, 2005](https://doi.org/10.1175/MWR2991.1) の方法）
- 正二十面体の辺に沿った分割を考えると、中心角は$\cos\theta=1/\sqrt{5}$となる角であることから$L_{min}=a \cos^{-1}(\frac{1}{\sqrt{5}})/2^n$
- 格子間隔が一様なら、
    - コントロールボリュームの平均的な面積 $A_{ave}=\frac{4\pi a^2}{N_c}$
    - 対応する長さスケールはその平方根 $L_{ave}=\sqrt\frac{4\pi a^2}{N_c}$

    （この方法は [Shibuya et al. (2015)](https://doi.org/10.1175/JAS-D-14-0228.1) など）
## 主要なglevelにおける格子間隔の例

|glevel|正二十面体の各辺の分割|$N_c$|$L_{eq}$|$L_{min}$|$L_{ave}$|$\Delta\theta_{ave}$|$A_{ave}$|
|---|---|---|---|---|---|---|---|
|0|1（分割なし）|12|8006km|7054km|6520km|59&deg;|42508308km<sup>2</sup>|
|1|2|42|4003km|3527km|3485km|31&deg;|12145231km<sup>2</sup>|
|2|4|162|2002km|1764km|1775km|16&deg;|3148764km<sup>2</sup>|
|3|8|642|1001km|882km|891km|8&deg;|794548km<sup>2</sup>|
|4|16|2562|500km|441km|446km|4&deg;|199102km<sup>2</sup>|
|5|32|10242|250km|220km|223km|2&deg;|49805km<sup>2</sup>|
|6|64|40962|125km|110km|112km|1.0&deg;|12453km<sup>2</sup>|
|7|128|163842|63km|55km|56km|0.5&deg;|3113km<sup>2</sup>|
|8|256|655362|31km|28km|28km|0.3&deg;|778km<sup>2</sup>|
|9|512|2621442|16km|14km|14km|0.1&deg;|195km<sup>2</sup>|
|n|$2^n$|$10\times4^n+2$|$\frac{2\pi a}{5\times 2^n}$|$\frac{a}{2^n}\cos^{-1}(\frac{1}{\sqrt{5}})$|$2a\sqrt{\frac{\pi}{N_c}}$|$\frac{360}{\sqrt{N_c\pi}}$|$\frac{4\pi a^2}{N_c}$|

（[Miura and Kimoto, 2005](https://doi.org/10.1175/MWR2991.1) などに同様の表がある）

# HEALPixの場合
（[Górski et al., 2005](https://doi.org/10.1086/427976)；需要ありそうなら）

# デモ
https://nihsok.github.io/wave-truncation/

*※実際の計算では、どの格子でも解像される最小波長は格子間隔の数倍程度となる*
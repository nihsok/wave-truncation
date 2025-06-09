# 全球スペクトルモデルにおける切断波数と格子点数との関係

水平スペクトル、球面調和関数、Legendre関数とは：https://www.gfd-dennou.org/arch/dcpam/dcpam4/dcpam4_current/doc/discretization/htm/node2.htm#tex2html2

三角形切断、平行四辺形切断、それ以外の切断方法について：https://www.gfd-dennou.org/library/dcpam/dcpam4/dcpam4-20071012/doc/discretization/htm/node6.htm#SECTION006810000000000000000

ある切断波数（と切断方法）に対して、エイリアシングを回避するための格子点数の下限が決められる。
- これに加え、計算効率のためFFTのかけやすい格子点数を選ぶ（実際はFFTのかけやすい格子点数が先にあって、適当な波数が選ばれている気もする）

格子の次数mを用いてm次格子と呼ぶ。
- 1次格子 (m=1; linear grid): 線形項しか含まないモデル（線形モデルとか？）あるいは移流項の計算にセミラグランジュ法を用いると、2次の非線形（移流）項を陽に扱わずにすむ。Lをつけた表記で線形格子であることを表す（例：三角切断の場合TL）。
- 2次格子 (m=2; quadratic grid): セミラグランジュ法を採用していないモデルでは、移流項を陽に扱う必要がある。セミラグランジュ法を用いていても、高解像度では移流項以外の非線形項（気圧傾度力、物理過程等）に伴うエイリアシング軽減のために用いられることがある。Qをつけた表記で2次格子であることを明記することもあるが、省略されることも多い（例：三角切断の場合TあるいはTQ）。
- 3次格子 (m=3; cubic grid): 同じくエイリアシングを避けるために使われる。

https://www.jma.go.jp/jma/kishou/books/npdc/r03/npdc_annual_report_r03_4-01.pdf
https://www.metsoc.jp/tenki/pdf/2017/2017_03_0057.pdf
（逓減格子についての記述あり）

4次以上の格子も同様に考えられそうだが、実用例は未確認。同じ格子点（解像度）なら次数が高いほど切断波数が小さくなるので、ルジャンドル変換のコストは小さくなる。
## 切断波数から格子点数を定める方法
1. 全波数 $N$ に対して、東西波数 $M$ は
    - 三角切断 (T) なら $M=N$
    - 平行四辺形切断 (R) なら $M=N/2$
2. 東西波数 $M$ の成分について、m次の非線形項をエイリアシングなしに表現するのに必要な東西格子点数は $I\ge(m+1)M+1$
3. FFTのかけやすい東西格子点数を選ぶ
4. 南北格子点数は $J\ge\frac{(m+1)N+1}{2}$ を満たす偶数とする

FFTのかけやすい格子点数はアルゴリズムによる。デモでは 2, 3, 5 のみで素因数分解できる数を探索している（数字が大きいと実装から大きくずれる可能性あり）

条件式について、理論（数式）による記述は以下の資料が詳しい：https://www.gfd-dennou.org/library/dcpam/dcpam4/dcpam4-20071012/doc/discretization/htm/node6.htm#SECTION006820000000000000000
## 格子点数から切断波数を計算する方法
上記と逆の手順。
1. 波数切断方法を選択（三角形切断T or 平行四辺形切断R）
2. FFTのかけやすい東西格子点数を選ぶ → $I$
3. 東西波数の最大値は $M=[\frac{I-1}{m+1}]$ ただし [ ] はそれを超えない最大の整数
4. 最大全波数Nを決める
    - 三角形切断なら $N=M$
    - 平行四辺形切断なら $N=2M$
5. 南北格子点数 $J\ge\frac{(m+1)N+1}{2}$ を決める（偶数にする）

## 主要な三角切断波数の例

|1次格子 (TL) |2次格子 (T or TQ)|I|$\Delta\theta$|$\Delta x$（赤道）|$\Delta x$（南北緯30度）|$\Delta x$（南北緯60度）|
|---|---|---|---|---|---|---|
||T42|128|2.8125&deg;|313km|271km|156km|
||T62,T63|192|1.875&deg;|209km|181km|104km|
||T85|256|1.40625&deg;|156km|135km|78km|
|TL159|T106|320|1.125&deg;|125km|108km|63km|
|TL255|T169|512|0.703125&deg;|78km|68km|39km|
|TL319|T213|640|0.5625&deg;|63km|54km|31km|
|TL479|T319|960|0.375&deg;|42km|36km|21km|
||T382|1152|0.3125&deg;|35km|30km|17km|
||T574|1728|0.20833&deg;|23km|20km|12km|
|TL959|T639|1920|0.1875&deg;|21km|18km|10km|
||T1279|3840|0.09375&deg;|10km|9km|5km|
||T2047|6144|0.0586&deg;|6.5km|5.6km|3.3km|
||T2559|7680|0.046875&deg;|5.2km|4.5km|2.6km|

こういった表は上記予報技術研修テキストや https://www.hysk.sakura.ne.jp/data_list/Reanalysis など

# Cubed sphere格子の場合
6面を構成するそれぞれの正方形（がゆがんだもの）をNExNEに分割する (NE: Number of Elements in each coordinate direction; [Lauritzen et al., 2018](https://doi.org/10.1029/2017MS001257))

さらに、それぞれのセルごとに基底関数を用いて離散化を行う。CESM/CAM-SEでは3次のGaussian quadrature（求積点は 4x4: np4）が使われる。グリッド配置は等間隔ではないが重み付けなので、ここでは単純に3分割されていると考える（近似）

- 格子点間隔が最も大きいのは赤道等の大円を分割するときで $L_{max}=2\pi a/(4NE\times3)$

- 格子点間隔が最も小さいのは六面体の各辺を分割するときで、この辺は $\cos\theta=1/3$ なる角（約70.5度）をなすので $L_{min}=a\cos^{-1}(1/3)/(NE\times3)$

- 格子間隔を一様にするための修正が行われている場合、求積点の数=分割後のセルの数 $=6\times9NE^2$
    - 求積点ひとつあたりが代表する平均的な面積は表面積を割り $A_{ave}=\frac{4\pi a^2}{54NE^2}$
    - これと等価なグリッドの長さはその平方根 $L_{ave}=\frac{2a}{3NE}\sqrt\frac{\pi}{6}$

それぞれの格子間隔は角度で表すこともできる（必ずしも経緯線と並行ではない）。 $\Delta\theta=360^\circ\times L/2\pi a$

## 主要な分割数における格子間隔の例

||$L_{min}$|$\Delta\theta_{min}$|$L_{max}$|$\Delta\theta_{max}$|$L_{ave}$|$\Delta\theta_{ave}$|$A_{ave}$|
|---|---|---|---|---|---|---|---|
|ne16np4|163.6km|1.47&deg;|208.7km|1.88&deg;|192.3km|1.73&deg;|36978.1km<sup>2</sup>|
|ne30np4 (~one degree)|87.2km|0.78&deg;|111.3km|1&deg;|102.6km|0.92&deg;|10518.2km<sup>2</sup>|
|ne60np4|43.6km|0.39&deg;|55.7km|0.5&deg;|51.3km|0.46&deg;|2629.6km<sup>2</sup>|
|ne120np4 (~quarter degree)|21.8km|0.2&deg;|27.8km|0.25&deg;|25.6km|0.23&deg;|657.4km<sup>2</sup>|
|ne240np4|10.9km|0.1&deg;|13.9km|0.13&deg;|12.8km|0.12&deg;|164.3km<sup>2</sup>|
|n|$\frac{a}{3n}\cos^{-1}(\frac{1}{3})$|$\frac{60}{n\pi}\cos^{-1}(\frac{1}{3})$|$\frac{2\pi a}{12n}$|$\frac{30}{n}$|$\frac{2a}{3n}\sqrt{\frac{\pi}{6}}$|$\frac{20}{n}\sqrt{\frac{6}{\pi}}$|$\frac{2\pi a^2}{27n^2}$|

（Lauritzen et al., 2018 では $L_{max}$ に対応する値が示されていると思われる）

# 正二十面体 (Icosahedral) 格子の場合
解像度は grid level ([Stuhne and Peltier, 1999](https://doi.org/10.1006/jcph.1998.6119)) あるいは grid division level (glevel; [Sato et al., 2008](https://doi.org/10.1016/j.jcp.2007.02.006)) で定義される。（この定義は [Thuburn (1997)](https://doi.org/10.1175/1520-0493(1997)125%3C2328:APBSWM%3E2.0.CO;2) とはひとつずれている）
- glevel-0のときは正二十面体に対応
- glevelひとつ増加ごとに各面の三角形を四分割するので、glevel-nのとき三角形の頂点の数（＝五角形or六角形のコントロールボリュームの数）は $N_c=10\times2^{2n}+2$

格子間隔は、
- 単純に赤道で考えると、glevel-nのとき $10\times2^{n-1}$ 個に分割されるので $L_{eq}=\frac{2\pi a}{10\times2^{n-1}}$
（[Tomita et al., 2002](https://doi.org/10.1006/jcph.2002.7193); [Miura and Kimoto, 2005](https://doi.org/10.1175/MWR2991.1) の方法）
- 正二十面体の辺に沿った分割を考えると、中心角は $\cos\theta=1/\sqrt{5}$ となる角であることから $L_{min}=a \cos^{-1}(\frac{1}{\sqrt{5}})/2^n$
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

半径は地球の値 a=6371.22km、扁平率は0とした

*※実際の計算では、どの格子でも解像される最小波長は格子間隔の数倍程度となる*
# Cocos Creator入门教学（全而简单版）_cocos教程-CSDN博客

今天周六休息，没啥事干，学一下做游戏吧。我想做一款横板2d竞速比赛游戏，练练手，**《谁能找到卵子宝宝？》或者精子勇敢向前冲**，美工：me ，开发: me ，策划:me 

今天的主角

![](https://i-blog.csdnimg.cn/direct/c97d000a26b54422abb08a51d773dd09.png)---

### 扫盲（懂的同学可跳过）：

Cocos Creator 是一款高效、轻量、免费开源的跨平台 2D&3D 图形引擎（2021年发布）。原来也有cocos 2d，2023年不维护，官网说creator有2d的所有功能，那我就用最新的creator。

官方教程写的也是比较**简陋，所以我才写这篇。**

#### **安装部署：**

1. 官网下载，dashboard [Cocos Creator 下载 - 轻量高效的开发引擎](https://www.cocos.com/creator-download)

![](https://i-blog.csdnimg.cn/direct/022c2659698743d39f9f7900a2978d37.png)

2. 在安装过程，【不选安装】visual studio （安装时间很长，只针对windows程序才需要）

 3. 左侧安装页，安装编辑器 cocos creator

![](https://i-blog.csdnimg.cn/direct/75ac60a402284236b34e972b622465ab.png)

4. 左侧选项目，然后新建项目，选一个empty2d模板

扫盲：模板，指的是空白项目。案例，指的是实际游戏资源。

![](https://i-blog.csdnimg.cn/direct/7275df8a7e1347da8a41f16e1dd843de.png)

因为不是很优雅，所以我改了个名（战士勇敢向前冲）

![](https://i-blog.csdnimg.cn/direct/5bfa4cea9e2448c6b2a4839d5f37c3a2.png)

#### 编辑器学习：

分成4部分

![](https://i-blog.csdnimg.cn/direct/1fed4ed40f2844bf90a28e48a93e1173.png)

**层级管理器：**显示层级对象关系（比如什么叠在什么上面这种）

**资源管理器：**图片，音频这种素材

**场景编辑器：**游戏中看到的具体内容

**属性选自额：**场景内的组件，对象相关的属性

**预览：**

**上方浏览器图标，**可将游戏选择在浏览器或者主机等运行

**点击右边播放按钮，**可以直接启动一个服务去运行

![](https://i-blog.csdnimg.cn/direct/9b158d362854464d8e1806a0bc90a4cb.png)

**资源预览（Asset prview)：**可以详细查看资源（比如图片缩略图）

**控制台(Console)：**可以查看代码日志（比如报错，运行结果等）

**动作编辑器（Animation）:**可以编辑和查看动画效果（比如多张图片走路等）

![](https://i-blog.csdnimg.cn/direct/c23d8670aba44358a822d84ea5cfcfcc.png)---

#### 国产软件，选择中文。

![](https://i-blog.csdnimg.cn/direct/cf304592e9304dbd93aba10816bfe4ae.png)

最上面菜单栏，File-&gt;Preference（自定义）-&gt;Language-&gt;中文

### 学习让物体动起来

条件：物体，移动逻辑

创建一个sprite（理解为是物体）

![](https://i-blog.csdnimg.cn/direct/848b07ea1d984941b322f812149a8d57.png)

我起了个名字叫Box，默认Box是一个图片

![](https://i-blog.csdnimg.cn/direct/d28ba216f4e64d4f8252da3be47f397e.png)

我们把我画好的勇士(user_me)，放到拖到资源管理器中

![](https://i-blog.csdnimg.cn/direct/faba26e128204170a45de0891af85776.png)

在场景编辑器中，选中，刚刚的Box，在右侧的属性管理中。点击Sprite Frame，点击旁边的More。给他放个图片上去。

![](https://i-blog.csdnimg.cn/direct/b89dea75ffd042328c6d329cf7de3357.png)

选择刚刚的user_me这个资源，然后太大了，改一下尺寸。

![](https://i-blog.csdnimg.cn/direct/6369e4bfb2f14e6f87ee945e4594d772.png)

改小了后

![](https://i-blog.csdnimg.cn/direct/56c5009ac1a546e7bf9c1fa467306e4c.png)

给精灵加一个控制脚本，本质就是通过绑定按键，控制像素的位置。

![](https://i-blog.csdnimg.cn/direct/28e1158c15d34e7fa887433a877be68f.png)

在资源组创建一个脚本（PlayController)，然后在层级管理器，点击刚刚创建的物体（我起的名字叫sprite）。然后对他的属性进行编辑，点击下面的添加组件，选择自定义脚本，把刚刚的脚本放上去。这样就绑定好了。

PlayController的代码如下:

```TypeScript
import { _decorator, Component, EventKeyboard, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    //定义移动
    private left =false
    private right =false
    private up =false
    private down =false

    //定义步数
    private step = 5
    //cocos内部的操作
 start() {
        input.on(Input.EventType.KEY_DOWN, this.keyDown, this);
        input.on(Input.EventType.KEY_UP, this.keyUp, this);
    }
    //渲染

    update(deltaTime: number) {
    let pos = this.node.position //物体移动的实现
    console.log("x的是:"+pos.x)
            if (this.left) pos.x -= this.step;
            if (this.right) pos.x += this.step;
            if (this.up) pos.y += this.step;
            if (this.down) pos.y -= this.step;
            // 更新节点位置
            this.node.setPosition(pos);

    }
    //按下
    keyDown(key: EventKeyboard) {
        switch (key.keyCode) {
            case 37: this.left = true; break;  // ←
            case 38: this.up = true; break;    // ↑ 
            case 39: this.right = true; break; // →
            case 40: this.down = true; break;  // ↓
        }
    }
    //松开
    keyUp(key: EventKeyboard) {
        switch (key.keyCode) {
            case 37: this.left = false; break;
            case 38: this.up = false; break;
            case 39: this.right = false; break;
            case 40: this.down = false; break;
        }
    }
    
}
```

### 预览：

![](https://i-blog.csdnimg.cn/direct/09e968b651e748fe81f720237e7bf877.png)

发现他可以移动了（通过按键，懒得搞gif图了，大家自行脑部吧）

![](https://i-blog.csdnimg.cn/direct/ed4859279de244f6bf6cd5650d822245.png)

今天就先这样，明天扣个图，加个背景。

### 碰撞组件

碰撞有2种，普通碰撞，物理碰撞。

举个例子，有2个人，你走过去和他打招呼，可见范围是10m，但是你没有碰到他，触发了打招呼。这个就是普通碰撞，他有一个不可见的碰撞块，碰到了就会触发打招呼。

另一个例子，他飞速冲过来撞到你了，你本身没有移动，但是却被他碰的后退了，这就是物理碰撞。

比如，我现在做2个方块的对话，当产生普通碰撞后，触发对话（换图）。

在场景编辑器里选中你的单位，然后点击属性里的添加组件

![](https://i-blog.csdnimg.cn/direct/e36a94ecb62840b7b9a4ebfcc75cbc91.png)![](https://i-blog.csdnimg.cn/direct/469b37d437144e189fe5e13d6fb8b4ad.png)

collider就是碰撞功能。我随便添加了一个BoxCollider后，选中Editting后，可以自由编辑碰撞组件的大小，达到剑虽未到风以伤人的目的。

![](https://i-blog.csdnimg.cn/direct/3fb9d07ffd92424898cd3914fd2b3b71.png)

举个例子，假设我给了一个很大的背景，到这个范围了，我就检测到了碰撞，就触发另一个事件。

比如我画个城堡，把碰撞的范围拉大覆盖了城堡的门口，到城堡之前就触发相关事件。

一定要保存ctrl+s场景，否则不生效。

### 触发代码（跳过，2d-empty游戏没有触发，只有碰撞）

有3种

OnColiderEnter 1.刚开始碰撞触发，这种比如刚进boss开图的时候动画等

OnColiderStay 2.持续碰撞，比如站在火焰里，持续扣血

OnColiderExit 3.碰撞结束时，触发

cc.director.getColiderManger.enable=true启动碰撞

**分组（加了才能碰撞）**

![](https://i-blog.csdnimg.cn/direct/9a4fef5bb9cd438799dd10592ce244d9.png)

添加分组，属性编辑器旁边的edit

![](https://i-blog.csdnimg.cn/direct/b9e38b385b7045aca9961df02b652798.png)

代表2个都是user分组时，才能碰撞。

![](https://i-blog.csdnimg.cn/direct/225dcd36810f43ce9fefa61bc0ee72fd.png)

添加完之后要重启cocos，不然不生效。

重启后就可以选择了。

![](https://i-blog.csdnimg.cn/direct/0b13a28dbdfd4dad86c66bd20c24d68f.png)

### 修改之后一定要保存ctrl+s在cocos里否则不生效

**2个组件，conllider（触发）和body（刚体），才能有碰撞回调。**

2d的话，选择sensor，代表无物理碰撞（类似触发）

然后也可以用碰撞回调去做这个触发。

在刚体中勾选enable 才能有碰撞回调

![](https://i-blog.csdnimg.cn/direct/c8293bc9bcd74d83bf975b3c11a7e4ab.png)

新建一个刚体后，选择Kinematic后，他才不会掉下去。

### 镜头（camera），怎么跟随人物移动。

大概就是人物移动的时候，镜头的x轴也跟着改变就行，这里我画了一个镜头外的参照物。

![](https://i-blog.csdnimg.cn/direct/81e6fcad665c4a7a9196e375b7b8e727.png)

默认是看不见的，只有移动过去才能看到，此时创建个脚本FollowerUser。

代码如下

```TypeScript
import { _decorator, Component, Node ,misc} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowerUser')
export class FollowerUser extends Component {
   @property({type:Node,tooltip:"镜头需要跟随的node"})
    target:Node= null; // 要跟随的目标节点（人物）
    @property(Number)
    followSpeed: number = 5; // 跟随速度

    @property(Number)
    leftBoundary: number = -500; // 左边界，当镜头x小于等于这个值时停止移动

    @property(Number)
    rightBoundary: number = 500; // 右边界，当镜头x大于等于这个值时停止移动

   

    start() {

    }

    update(deltaTime: number) {
        // 计算目标位置
        let targetPos = this.target.getPosition();
        let cameraPos = this.node.getPosition();
        //只在x轴上跟随
        let newX = targetPos.x;
        
        // 检查边界
        if (newX <= this.leftBoundary) {
            newX = this.leftBoundary;
        } else if (newX >= this.rightBoundary) {
            newX = this.rightBoundary;
        }

    
        // 直接跟随
        cameraPos.x = newX;
        // console.log("物体x是"+newX)
        // console.log("相机x是"+cameraPos.x)
        // 更新相机位置
        this.node.setPosition(cameraPos);
    }
}
```

然后选中镜头，给他添加个自定义脚本，fllowerUser。然后把node拖拽过去（Target里）

![](https://i-blog.csdnimg.cn/direct/aea6c1a5e2b4449497c33ca5cfc1372e.png)

然后启动，刚开始是没有的，按右移动就可以看见参照物了。

![](https://i-blog.csdnimg.cn/direct/68fe9c0a468943bba7680cdba9cafb66.png)

走了一段时间后

![](https://i-blog.csdnimg.cn/direct/135dc1bef19c4653ab5fc31f5fcd2cd6.png)

### 边界的镜头是什么？空气墙

建一个精灵，选个刚体RigidBody2D，选一个BoxCollider2D

![](https://i-blog.csdnimg.cn/direct/5680b23d59ca4fdbad45b8cebfc9ef85.png)

这几个勾选

![](https://i-blog.csdnimg.cn/direct/fb3f685a018d4e0eb7779fad631e8237.png)

然后就可以了，走不过去了

![](https://i-blog.csdnimg.cn/direct/c188a97777a449748730e6f8dc2dc62f.png)

然后在给墙，加个颜色就隐身了。

![](https://i-blog.csdnimg.cn/direct/a44a332565f04ef5b00d48a10ef43be9.png)

### 对于2D来说，怎么知道他属于触发，还是属于碰撞？

通过tag来确定，在项目管理，项目设置-&gt;物理里可以添加。这个就是默认的tag(index0）

![](https://i-blog.csdnimg.cn/direct/4f08077862ad4f78ba6f7ed3e84f11d5.png)

对应的就是，BoxCollider2D里的tag和Group

先弄个碰撞给大伙瞧瞧

碰撞指的是2个物体之间产生。

比如我这里白盒子和地面的碰撞，和空气墙的碰撞。

白盒子：必须要有BoxCollider2D和collider2种属性

地面:必须要有BoxCollider2D和collider2种属性

 然后假如让白盒子触发，那给他的自定义脚本里面加入

```TypeScript
import { _decorator, Collider2D, Component, Contact2DType, EventKeyboard, Input, input, IPhysics2DContact, Node, RigidBody2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;  
onLoad() {
        let collider=this.getComponent(Collider2D)
        console.log("加载碰撞")
        //加载碰撞，如果有碰撞发生泽调用函数
        if(collider){
           collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        console.log('碰撞发生'+otherCollider.tag);
    }
```

然后结果,碰撞后会有打印

![](https://i-blog.csdnimg.cn/direct/9d3d1b1dae7643a0a594141ed70d830d.png)

参考：

[物理事件 | Cocos Creator](https://docs.cocos.com/creator/3.8/manual/zh/physics/physics-event.html#%E8%A7%A6%E5%8F%91%E8%A7%84%E5%88%99)

[零基础自学cocos游戏制作1-键盘控制物体移动_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Je411V7Ud/?vd_source=24b9944a269d4e2f821cc0f59da91d85)

[教程｜Cocos Creator 编辑器入门：02编辑器安装与界面介绍_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1rrEfzNEfu?spm_id_from=333.788.videopod.sections&vd_source=24b9944a269d4e2f821cc0f59da91d85)

---
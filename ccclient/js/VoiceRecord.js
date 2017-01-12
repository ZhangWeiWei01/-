/**
 * Created by Fanjiahe on 2016/5/7.
 */


createAnimation = function (path, count, rect)
{
	var frames = [];
	for (var temp_x = 0; temp_x < count; temp_x++)
	{
		var fileName = path + temp_x + ".png";
		var frame = new cc.SpriteFrame(fileName, rect);
		frames.push(frame);
	}
	var animation = new cc.Animation(frames, 0.25);
	return new cc.Animate(animation);
};


var VoiceRecordLayer = cc.Layer.extend({
	jsBind: {
		_run: function ()
		{
			this.callback = function ()
			{
				this.getParent().setVisible(false);
			}
		},
		_layout: [[1, 1], [0.5, 0.5], [-0.5, -0.5]],
		_event: {
			runCancelRecord: function ()
			{
				this.scheduleOnce(this.callback, 0.5);
			}, runStartRecord: function ()
			{
				this.getParent().setVisible(true);
				this.unschedule(this.callback);
			}, runToCancelRecord: function ()
			{
				this.getParent().setVisible(true);
			}, runStopRecord: function ()
			{
				this.unschedule(this.callback);
				this.callback();
			}, runShortRecord: function ()
			{
				this.scheduleOnce(this.callback, 0.5);
			}
		},
		back: {
			backGround: {
				voiceIcon: {
					_event: {
						runCancelRecord: function ()
						{
							this.setVisible(false);
						},
						runStartRecord: function ()
						{
							this.setVisible(true);
						},
						runToCancelRecord: function ()
						{
							this.setVisible(false);

						},
						runStopRecord: function ()
						{
							this.setVisible(true);

						},
						runShortRecord: function ()
						{
							this.setVisible(false);
						}
					}
				},
				voiceStatusIcon: {
					_run: function ()
					{
						var VoiceStatusAnimate = createAnimation("res/animate/startRecord/", 7, cc.rect(0, 0, 44, 82));
						this.runAction(cc.repeatForever(VoiceStatusAnimate));
					},
					_event: {
						runCancelRecord: function ()
						{
							this.setVisible(false);
						},
						runStartRecord: function ()
						{
							this.setVisible(true);
						},
						runToCancelRecord: function ()
						{
							this.setVisible(false);
						},
						runStopRecord: function ()
						{
							this.setVisible(true);
						},
						runShortRecord: function ()
						{
							this.setVisible(false);
						}
					}
				},
				voiceCancel: {
					_event: {
						runCancelRecord: function ()
						{
							this.setVisible(true);
						},
						runStartRecord: function ()
						{
							this.setVisible(false);
						},
						runToCancelRecord: function ()
						{
							this.setVisible(true);
						},
						runStopRecord: function ()
						{
							this.setVisible(false);
						},
						runShortRecord: function ()
						{
							this.setVisible(false);
						}
					}
				}, voiceShort: {
					_event: {
						runCancelRecord: function ()
						{
							this.setVisible(false);
						},
						runStartRecord: function ()
						{
							this.setVisible(false);
						},
						runToCancelRecord: function ()
						{
							this.setVisible(false);
						},
						runStopRecord: function ()
						{
							this.setVisible(false);
						},
						runShortRecord: function ()
						{
							this.setVisible(true);
						}
					}
				}, tipsLabel: {
					_event: {
						runCancelRecord: function ()
						{
							this.setString("取消发送");
						},
						runStartRecord: function ()
						{
							this.setString("手指上滑 , 取消发送");
						},
						runToCancelRecord: function ()
						{
							this.setString("松开手指 , 取消发送");
						},
						runStopRecord: function ()
						{

						},
						runShortRecord: function ()
						{
							this.setString("录音时间太短");
						}
					}
				}
			}
		}
	},
	ctor: function ()
	{
		this._super();
		var playui = ccs.load(res.VoiceRecord_Json);
		ConnectUI2Logic(playui.node, this.jsBind);
		this.addChild(playui.node);
		return true;
	}
});
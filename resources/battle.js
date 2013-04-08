			var BattleLogMsg = (function(msg,dly) {
				var LastPending = 0;
				
				function getAbsTime(dly) {
					var currentMillis = new Date().getTime();
					LastPending = ((LastPending < currentMillis) ? currentMillis : LastPending) + dly;
					return LastPending;
				}
				
				return function(msg, dly) {
					var absTime = getAbsTime(dly);
					
					this.time = absTime;
					this.msg = msg;
				}
			})();
			var BattleLog = {
				MaxLines: 10,
				log: [],
				pending: [],
				interval: null,
				append: function(msg, dly) {
					var btlMsg = new BattleLogMsg(msg, dly);
					this.pending.unshift(btlMsg);
				},
				start: function() {
					var _self = this;
					this.interval = setInterval(function() {
						var currentMillis = new Date().getTime();
						var updateLog = false;
						var bm;

						while (_self.pending.length > 0) {
							bm = _self.pending.pop();
							if (bm.time <= currentMillis) {
								_self.log.unshift(bm);
								updateLog = true;
							} else {
								_self.pending.push(bm);
								break;
							}
						}
						
						while (_self.log.length > BattleLog.MaxLines) {
							_self.log.pop();
							updateLog = true;
						}
						
						var newLog = "";
						for (var i = 0; i < _self.log.length; ++i) {
							newLog = _self.log[i].msg + "<br/>" + newLog;
						}
						jQuery("#battleLog").html(newLog);
						
						TheBoss.showHealth(jQuery("#horrorHealth"));
						TheHero.showHealth(jQuery("#heroHealth"));
						TheHero.updateHint();
					}, 100);
				},
				stop: function() {
					clearInterval(this.interval);
					this.interval = null;
				}
			}
			var TheBoss = {
				HealthImages: ["resources/monsterempty.png", "resources/monsterempty.png", "resources/monsterquarter.png", "resources/monsterhalf.png", "resources/monsterthreequarter.png", "resources/monsterfull.png"],
				AttackNames: ["HARDEN", "FLY SWATTER", "SPIRIT DRAIN", "PSYCHO CRUSER", "BLACK HOLE"],
				AttackHint: ["ENDLESS HORROR's shell is shining bright!!",
								"ENDLESS HORROR raises the arm on top!",
								"ENDLESS HORROR appears one of their mouths!",
								"ENDLESS HORROR is staring at you intently!",
								"ENDLESS HORROR started shaking violently!"],
				AttackCounters: [2, 3, 0, 4, 1],
				AttackDamage: [1, 4, 8, 8, 12],
				MinAttackDamage: [0, 1, 2, 4, 8],
				DefenceMods: [2.0, 0.9, 1.0, 0.5, 0.25],
				OpAtkMods: [1.0, 1.0, 0.9, 0.5, 1.0],
				Defence: 8,
				nextAttack: -1,
				currentHp: 100,
				prepareAttack: function() {
					this.nextAttack = Math.floor(Math.random() * this.AttackNames.length);
					var currentLog = jQuery("#battleLog").html();
					BattleLog.append("<span class='blInfo'>" + this.AttackHint[this.nextAttack] + "</span>", 100);
				},
				attackName: function() {
					return this.AttackNames[this.nextAttack];
				},
				optimal: function() {
					return this.AttackCounters[this.nextAttack];
				},
				baseDamage: function() {
					return Math.floor(Math.random() * this.AttackDamage[this.nextAttack]) + this.MinAttackDamage[this.nextAttack];
				},
				defMod: function() {
					return this.DefenceMods[this.nextAttack];
				},
				opAttackMod: function() {
					return this.OpAtkMods[this.nextAttack];
				},
				takeDamage: function(dmg) {
					this.currentHp -= dmg;
					return (this.currentHp >= 0);
				},
				showHealth: function(bar) {
					var currentHp = Math.max(this.currentHp, 0);
					var marks = Math.floor(currentHp / 5.0);
					var filled = "";
					for (var i = 0; i < marks; ++i) {
						filled += "<img src='" + this.HealthImages[5] + "'/>";
					}
					if (currentHp % 5 > 0) {
						filled += "<img src='" + this.HealthImages[currentHp % 5] + "'/>";
					}
					jQuery(bar).html(filled);
				}
			};
			var TheHero = {
				HealthImages: ["resources/heartempty.png", "resources/heartempty.png", "resources/heartquarter.png", "resources/hearthalf.png", "resources/heartthreequarter.png", "resources/heartfull.png"],
				AttackNames: ["WITCH BEAM", "NINJA KUNAI", "BRUISER FIST", "TENTACLE WHIP", "CRYSTAL DEFENDER"],
				DefaultHint: "Choose an attack!",
				AttackHint: ["Focus power for big attack beam!",
								"Become shadow and attack from corner!",
								"Big punch cannot be ignored!",
								"Assimilation tube is to hit hard!",
								"Become as crystal and cannot be pain!"],
				AttackDamage: [12, 8, 8, 4, 4],
				MinAttackDamage: [8, 4, 4, 2, 1],
				DefenceMods: [1.0, 1.0, 1.0, 1.0, 2.0],
				Defence: 4,
				nextAttack: -1,
				currentHp: 100,
				showHint: function(node) {
					var atkId = jQuery(node).children("[name='attacks']").val();
					jQuery("#playerControlHint").text(this.AttackHint[atkId]);
				},
				updateHint: function() {
					if (this.nextAttack >= 0 && this.nextAttack < this.AttackNames.length) {
						jQuery("#playerControlHint").text(this.AttackHint[this.nextAttack]);
					} else {
						jQuery("#playerControlHint").text(this.DefaultHint);
					}
				},
				setAttack: function() {
					this.nextAttack = jQuery("[name='attacks']").filter(":checked").val();
					jQuery("#heroAttack").prop("disabled", false);
				},
				attackName: function() {
					return this.AttackNames[this.nextAttack];
				},
				baseDamage: function() {
					return Math.floor(Math.random() * this.AttackDamage[this.nextAttack]) + this.MinAttackDamage[this.nextAttack];
				},
				defMod: function() {
					return this.DefenceMods[this.nextAttack];
				},
				takeDamage: function(dmg) {
					this.currentHp -= dmg;
					return (this.currentHp >= 0);
				},
				showHealth: function(bar) {
					var currentHp = Math.max(this.currentHp, 0);
					var marks = Math.floor(currentHp / 5.0);
					var filled = "";
					for (var i = 0; i < marks; ++i) {
						filled += "<img src='" + this.HealthImages[5] + "'/>";
					}
					if (currentHp % 5 > 0) {
						filled += "<img src='" + this.HealthImages[currentHp % 5] + "'/>";
					}
					jQuery(bar).html(filled);
				}
			}
			
			function endBattle(nextPassage) {
				jQuery("#battleFinish").html('<a id="' + nextPassage + '" href="javascript:void(0)" class="internalLink" onclick="state.display(this.id, this);">Continue</a>.');
			}
			
			function attack() {
				if (TheHero.nextAttack < 0 || TheHero.nextAttack >= TheHero.AttackNames.length) {
					return;
				}
				
				var bossAttack = "<span class='blHorror'>The <b>ENDLESS HORROR</b> attacks with " + TheBoss.attackName() + "!</span>";
				var heroAttack = "<span class='blHero'><b>YOU</b> counter with " + TheHero.attackName() + "!</span>";
				BattleLog.append(bossAttack, 200);
				BattleLog.append(heroAttack, 200);
				
				// This round's modifiers
				var bossDefMod = 1.0;
				var bossAtkMod = 1.0;
				var heroDefMod = 1.0;
				var heroAtkMod = 1.0;
				
				// Check for perfects first
				if (TheHero.nextAttack == TheBoss.nextAttack) {
					// Perfect! Update modifiers
					BattleLog.append("<span class='blInfo'>It has PERFECT DEFENCE!</span>", 200);
					
					// Basically, for a perfect, the boss does no damage and looses defence
					bossDefMod = bossAtkMod = 0;
					// The hero crits, which is 150% damage
					heroAtkMod = 1.5;
				} else if (TheHero.nextAttack == TheBoss.optimal()) {
					// Boss perfect!  Update modifiers
					BattleLog.append("<span class='blInfo'>The ENDLESS HORROR has PEFECT ATTACK!</span>", 200);
					
					// First, the boss crits, so 150% damage
					bossAtkMod = 1.5;

					// Next, the hero's defence falters
					heroDefMod = 0.5;
					// And the hero's attack is very weak
					heroAtkMod = 0.25;
				}
				
				// --------------------------------------------------------------------------------------------------------
				//
				//    BOSS PHASE
				//
				// --------------------------------------------------------------------------------------------------------
				
				var bossBaseDmg = TheBoss.baseDamage();
				var bossPreDefDmg = Math.ceil(bossBaseDmg * bossAtkMod);
				var hitType =(bossAtkMod >= 1.5) ? "CRITICAL" : "HITS";
				
				BattleLog.append("<span class='blHorror'>The ENDLESS HORROR " + hitType + " for " + bossPreDefDmg + " damage!</span>", 200);

				var dead = !TheHero.takeDamage(bossPreDefDmg);
				TheHero.showHealth(jQuery("#heroHealth"));
				
				if (dead) {
					BattleLog.append("<span class='blInfo'>You have been defeated by the ENDLESS HORROR!</span>", 200);
					endBattle("defeat");
					return;
				}
				
				// --------------------------------------------------------------------------------------------------------
				//
				//    HERO PHASE
				//
				// --------------------------------------------------------------------------------------------------------
				
				var heroBaseDmg = TheHero.baseDamage();
				var heroPreDefDmg = Math.floor(heroBaseDmg * heroAtkMod);
				var hitType =(heroAtkMod >= 1.5) ? "CRITICAL" : "HITS";

				BattleLog.append("<span class='blHero'>You " + hitType + " for " + heroPreDefDmg + " damage!</span>", 200);
				
				var defeated = !TheBoss.takeDamage(heroPreDefDmg);
				TheBoss.showHealth(jQuery("#horrorHealth"));
				
				if (defeated) {
					BattleLog.append("<span class='blInfo'>You have defeated the ENDLESS HORROR!</span>", 200);
					endBattle("weak");
					return;
				}
				
				// Next attack
				TheBoss.prepareAttack();
			}
			
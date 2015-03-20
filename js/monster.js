// Monster class
function Monster(game, category, posX, spawner) {
    // Find the first level monster of its category
    var type = window.data.upgrade_data.monsters[category][0];
    
    // Inherits from FightingObject
    var _superclass = FightingObject(game, type, {x: posX, y: 0});
    
    /**
     * Monster actions/controller
     */
    var controller = _superclass.c;
    
    // Update the monster - performed on every tick of the game's clock
    controller.update = function() {
        // Check to see if there is a non-idle action the Monster can take
        if (model.state === "idle") {
            this.calculateNewAction();
        }
        
        // Update monster based upon what action it is currently performing
        if (model.hasOwnProperty("abilities")) {
            this.updateState();
        }
    };
    
    // Calculate what action the monster should take next
    controller.calculateNewAction = function() {
        if (model.hasOwnProperty("abilities")) {
            // Find the closest hero
            var closestHero = this.getClosest(heroes);
            
            if (closestHero !== null ) {
                // Is hero within melee range?
                if (closestHero.distance === "melee") {
                    // Find all melee abilities
                    var meleeAbilities = [];
                    
                    // Interate through all the monster's abilities checking to see
                    // if they are melee attacks
                    for (var i = 0; i < model.abilities.length; i++) {
                        var ability = model.abilities[i];
                        if (ability.type === "melee_attack") {
                            meleeAbilities.push(ability);
                        }
                    }
                    
                    // Select a random melee attack from the list of abilities
                    var ability = meleeAbilities[MathEx.randInt(0, meleeAbilities.length - 1)];
                    
                    // Play attack animation
                    view.animations.play(ability.animation);
                    
                    // Update monster state
                    model.state = ability.type;
                    model.action = ability;
                    model.target = closestHero.obj;
                } else {
                    // Does the monsters have any non-melee abilities?
                    var nonMeleeAbilities = [];
                    
                    // Interate through all the monster's abilities checking to see
                    // if they are non-melee
                    for (var i = 0; i < model.abilities.length; i++) {
                        var ability = model.abilities[i];
                        if (ability.type !== "melee_attack") {
                            // Check to see if ability doesn't have cooldown
                            if (!ability.hasOwnProperty("cooldown")) {
                                // Ability is always ready to use, add to list of
                                // useable abilities
                                nonMeleeAbilities.push(ability);
                            } else {
                                // If cooldown period is complete add to list of
                                // useable abilities (don't reset the cooldown until
                                // it is actually certain it being used though)
                                if (ability.cooldown <= 0) {
                                    nonMeleeAbilities.push(ability);
                                } else {
                                    // Count down cooldown
                                    // TODO: use real time instead of ticks
                                    ability.cooldown--;
                                }
                            }
                        }
                    }
                    
                    if (nonMeleeAbilities.length > 0) {
                        // Select a random ability to use from the list of abilities
                        var ability = nonMeleeAbilities[MathEx.randInt(0, nonMeleeAbilities.length - 1)];
                        
                        // Play ability's animation
                        view.animations.play(ability.animation);
                        
                        // Update monster's state
                        model.state = ability.type;
                        model.action = ability;
                        model.target = closestHero.obj;
                        
                        // If abiltity had cooldown, reset it
                        if (ability.hasOwnProperty("cooldown")) {
                            ability.cooldown = ability.cooldownLength;
                        }
                    }
                }
            }
        }
    };
    
    // Update function called each tick when performing a enhancer action
    controller.update_enhancer = function() {
        // Check if ability animation is completed
        if (view.animations.getAnimation(model.action.animation).isFinished) {
            // Find this monster's spawner's index
            var index = spawners.getIndex(model.spawner);
            
            // Find out which monsters to enhance
            for (var i = 0; i < model.action.targets.length; i++) {
                // Get the target
                var targetIndex = index + model.action.targets[i];
                var targetSpawner = spawners.get(targetIndex);
                if (targetSpawner === -1) {
                    // Not a valid target, skip
                    continue;
                }
                var target = targetSpawner.m.monster;
                if (target === null) {
                    // Not a valid target, skip
                    continue;
                }
                
                // Apply effect to target, if acceptable
                if (model.action.hasOwnProperty("status")) {
                    target.c.applyStatus(model.action.status);
                }
            }
            
            // Go back to idle state
            model.state = "idle";
            model.action = null;
        }
    };
    
    // Upgrades the monster to the next level monster in its category
    // Returns true if the monster was upgraded, else returns false
    controller.upgrade = function() {
        /* Step 1. Level up */
        
        // Don't upgrade beyond level 3
        if (model.level === 3) {
            // Monster has reach upgrade limit, don't upgrade
            return false;
        }
        
        // No errors thrown, go ahead and increase the level
        model.level++;
        
        /* Step 2. Reload data based upon new level */
        
        // Update the monster's type based upon its level
        model.type = window.data.upgrade_data.monsters[model.category][model.level - 1];
        
        // Load monster stats from window.data.model_data
        if (window.data.model_data.hasOwnProperty(model.type)) {
            for (var property in window.data.model_data[model.type]) {
                if (window.data.model_data[model.type].hasOwnProperty(property)) {
                    model[property] = window.data.model_data[model.type][property];
                }
            }
        }
        
        // Load view data from window.data.view_data
        if (window.data.view_data.hasOwnProperty(model.type)) {
            model.viewInfo = {};
            for (var property in window.data.view_data[model.type]) {
                if (window.data.view_data[model.type].hasOwnProperty(property)) {
                    model.viewInfo[property] = window.data.view_data[model.type][property];
                }
            }
        }
        
        /* Step 3. Update monster with new properties */
        
        // Scale the sprite based upon the data defined in view_data
        if (model.viewInfo.hasOwnProperty("scale")) {
            if (model.viewInfo.scale.hasOwnProperty("x")) {
                view.scale.x = model.viewInfo.scale.x;
            }
            
            if (model.viewInfo.scale.hasOwnProperty("y")) {
                view.scale.y = model.viewInfo.scale.y;
            }
        }
        
        // Is the sprite visible?
        if (model.viewInfo.hasOwnProperty("visible")) {
            view.visible = model.viewInfo.visible;
        } else {
            // Defaults to true
            view.visible = true;
        }
        
        // Tint the sprite
        if (model.viewInfo.hasOwnProperty("tint")) {
            view.tint = model.viewInfo.tint;
        }
        
        // Switch to default animation to avoid confilicts
        view.animations.play("idle");
        
        // Switch the texture of the sprite
        view.loadTexture(model.viewInfo.image);
        view.body.setSize(view.width, view.height);
        
        // Add all animations defined in view_data
        if (model.viewInfo.hasOwnProperty("animations")) {
            // Interat through each animation an add each indivdually
            for (var anim in model.viewInfo.animations) {
                if (model.viewInfo.animations.hasOwnProperty(anim)) {
                    // Is the animation looping? (default to true if not defined in view data file)
                    var loop = true;
                    if (model.viewInfo.animations[anim].hasOwnProperty("loop")) {
                        loop = model.viewInfo.animations[anim].loop;
                    }
                    
                    view.animations.add(anim, model.viewInfo.animations[anim].frames, FPS, loop);
                }
            }
        }
        
        // Update monster's maximum health
        model.maxHealth = model.health;
        
        // Fix physics body size
        view.body.setSize(Math.abs(view.width / view.scale.x), Math.abs(view.height / view.scale.y));
        
        // Save initial height and width for latter
        model.width = view.width;
        model.height = view.height;
        
        view.animations.play("idle");
        
        // Reset state variables
        model.state = "idle";
        model.action = null;
        model.target = null;
        
        return true;
    };
    
    // Destroy this monster and remove it from the game world
    controller.destroy = function() {
        // Remove monster association with its spawner
        model.spawner.m.monster = null;
        
        // Remove monster from game world
        monsters.remove(monsters.getParentOfView(view));
    };
    
    // Debug the hero's reach by drawing a rectangle on the screen
    controller.debugReach = function() {
        var reach = new Phaser.Rectangle(view.x - Math.abs(model.width) / 2 + model.reach[0],
                                         game.height - view.height,
                                         model.reach[1] - model.reach[0],
                                         view.height);
        game.debug.geom(floor, '#0fffff');
    };
    
    // Handle the monster being tapped/clicked
    controller.handleInputDown = function(view, pointer) {
        ui.setActiveObject(model.spawner);
    };
    
    /**
     * Monster data/model
     */
    var model = _superclass.m;
    
    // Save the monster's category
    model.category = category;
    
    // The level of the monster (from 1 to 3)
    model.level = 1;
    
    // The spawner the monster was spawned on
    model.spawner = spawner;
    
    // Make projectiles fired by this Monster target heroes
    model.targets = window.heroes;
    
    /**
     * Monster sprite/view
     */
    var view = _superclass.v;
    
    // Monsters don't move
    view.body.velocity.x = 0;
    
    // Setup event handling
    view.inputEnabled = true;
    view.events.onInputDown.add(controller.handleInputDown, controller);
    
    /**
     * Init sprite
     */
    view.animations.play("idle");
    
    /**
     * Generate object that is an instance of this class
     */
    return {
        m: model,
        v: view,
        c: controller,
        type: "Monster"
    };
}
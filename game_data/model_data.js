window.data = window.data || {}; // Make sure window.data is defined

window.data.model_data = {
	"soldier": {
		"velocity": 100,
		"flying": false
	},
	"tank": {
		"velocity": 50,
		"flying": false
	},
	"jet": {
		"velocity": 300,
		"flying": {
			"min": 240,
			"max": 420
		}
	},
	"helicopter": {
		"velocity": 200,
		"flying": {
			"min": 240,
			"max": 420
		}
	},
	"scrapyard robot": {
		"velocity": 100,
		"flying": false
	},
	"werewolf": {
		"velocity": 300,
		"flying": false
	},
	"bullet tower": {
		"velocity": 0.01,
		"attacks": true
	},
	"destroyed tower": {
		"velocity": 0,
		"attacks": false
	},
    "alien item": {
        "velocity": 300
    },
    "biochem item": {
        "velocity": 300
    },
    "tech item": {
        "velocity": 300
    }
};
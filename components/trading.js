var Steam = require('steam');
var SteamUser = require('../index.js');
var SteamID = require('steamid');

SteamUser.prototype.trade = function(steamID) {
	if(typeof steamID !== 'string') {
		steamID = steamID.toString();
	}

	this._send(Steam.EMsg.EconTrading_InitiateTradeRequest, {"other_steamid": steamID});
};

SteamUser.prototype.cancelTradeRequest = function(steamID) {
	if(typeof steamID !== 'string') {
		steamID = steamID.toString();
	}

	this._send(Steam.EMsg.EconTrading_CancelTradeRequest, {"other_steamid": steamID});
};

// Handlers

SteamUser.prototype._handlers[Steam.EMsg.EconTrading_InitiateTradeProposed] = function(body) {
	var self = this;
	// TODO: See if other_name is actually filled in, and remove if not
	this.emit('tradeRequest', body.other_name, new SteamID(body.other_steamid), function(accept) {
		self._send(Steam.EMsg.EconTrading_InitiateTradeResponse, {
			"trade_request_id": body.trade_request_id,
			"response": accept ? Steam.EEconTradeResponse.Accepted : Steam.EEconTradeResponse.Declined
		});
	});
};

SteamUser.prototype._handlers[Steam.EMsg.EconTrading_InitateTradeResult] = function(body) {
	// Is trade ID meaningful here?
	this.emit('tradeResponse', new SteamID(body.other_steamid), body.response, {
		"steamguardRequiredDays": body.steamguard_required_days,
		"newDeviceCooldownDays": body.new_device_cooldown_days,
		"defaultPasswordResetProbationDays": body.default_password_reset_probation_days,
		"passwordResetProbationDays": body.password_reset_probation_days,
		"defaultEmailChangeProbationDays": body.default_email_change_probation_days,
		"emailChangeProbationDays": body.email_change_probation_days
	});
};

SteamUser.prototype._handlers[Steam.EMsg.EconTrading_StartSession] = function(body) {
	this.emit('tradeStarted', new SteamID(body.other_steamid));
};
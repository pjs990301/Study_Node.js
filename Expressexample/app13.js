var express = require('express');
var http = require('http');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParse = require('cookie-parser');
var static = require('serve-static');
var errorHandler = require('errorhandler');

var expressErrorhandler = require('express-error-handler');
var expressSession = require('express-session');

var multer = require('multer');
var fs = require('fs');

var cors = require('cors');

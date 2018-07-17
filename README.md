# node-html-emails 
![npm](https://img.shields.io/npm/l/express.svg)

Localized HTML email templates for node.

* Uses [Handlebars](http://handlebarsjs.com/) as templating engine
* Makes localization with [i18n](https://github.com/mashpie/i18n-node)
* You can write your own css file which will be inlined with [juice](https://github.com/Automattic/juice)

Make your own mail templates using [Handlebars](http://handlebarsjs.com/), run it through this package to generate the HTML-string which is ready to be sent with your choice of node-mailer.

# Installation

```
npm install node-html-emails --save
```

# Usage

```js
const app = require('express')();

// The nhe constructor
const NHE = require('node-html-emails');

// The descriptor tells nhe what layout and partial(s) to use to generate the template
// In this case the backbone of the html email will be the main layout
// And the content of the email comes from the activation partial
// By default nhe parses .hbs templates and registers them by their names. E.g 
// main.layout.hbs can be refrenced as "main", and activation.partial.hbs as activation so on..
const templateDescriptors = {
  activation: {
    layout: 'main',
    content: 'activation'
  }
};

// We need to tell nhe the root of your project and it will search for *.layout.hbs and *.partial.hbs
// files in it by default. But it can be configured as well.
// We also need to tell nhe the directory where your translation files are held
const nheOptions = {
  root: path.resolve(__dirname),
  locales: {
    locales: ['en', 'hu'],
    directory: `${__dirname}/locales`
  }
}

// Instantiation
const nhe = new NHE(templateDescriptors, nheOptions);

app.post('/mail/:type', (req, res) => {
  const type = req.params.type;
  const lang = req.query.lang || 'en';

  const templateParams = { email: 'some@email.com' };

  // Generating output for your email. In a real world example "htmlString" will be used as the body
  // of your email. Here, for demonstration, we send it back as the response for the request.
  const htmlString = nhe.generate(type, templateParams, { locale: lang });

  // Go on, make a POST request to http://localhost:3000/mail/activation?lang=en|hu in postman to
  // preview your email
  res.send(htmlString);
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
```
For the example to work you will need to have a `main.layout.hbs` and an `activation.partial.hbs` in your project somewhere. The package will precompile these templates for you.

For example 

## main.layout.hbs

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta name="viewport" content="width=device-width" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Example</title>
</head>

<body>
  <table class="body-wrap">
    <tr>
      <td></td>
      <td class="container" width="500">
        <div class="content">
          <table class="main" width="100%" cellpadding="0" cellspacing="0">
            {{>content}}
          </table>
        </div>
      </td>
      <td></td>
    </tr>
  </table>
</body>

</html>
```

## activation.partial.hbs

```html
<tr>
  <td>
    {{ translate 'GREETING' }}&nbsp;{{ email }},<br/>
    {{ translate 'ACTIVATION_MSG' }}
  </td>
</tr>
```

For the translation to work you'll need translation files located somewhere in your project

## /locales/en.json

```json
{
  "GREETING": "Dear",
  "ACTIVATION_MSG": "Your account has been activated."
}
```

## /locales/hu.json

```json
{
  "GREETING": "Kedves",
  "ACTIVATION_MSG": "A fiókja aktiválásra került."
}
```
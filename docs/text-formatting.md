# Text Formatting

#WOKEWeekly develops in-house. As such, we've developed our own system of rich-text formatting. If you're familiar with Markdown, it's very similar. We've based our formatting off of Markdown but with a few tweaks.

## Emphasis

These rules generally apply to inline text which you can use for text within paragraphs.

For italic text, use single asterisks:

```
*Black is beautiful.*
```
> _Black is beautiful._

For bold text, use double asterisks:

```
**Black is beautiful.**
```
> **Black is beautiful.**

For bold-italic text, use \*\*\*triple asterisks\*\*\*

```
***Black is beautiful.***
```
> ***_Black is beautiful._***

For underlined text, use underscores.

```
_Black is beautiful._
```
> <span style="text-decoration: underline">Black is beautiful.<span>

For strikethrough text, use tildes.

```
~Black is beautiful.~
```
> ~~Black is beautiful.~~

#### Hyperlinks

For hyperlinked text, the pattern should look like the following:

```
Black [is beautiful](https://www.wokeweekly.co.uk) and always will be.
```
> Black [is beautiful](https://www.wokeweekly.co.uk) and always will be.

## Sections

These are blocks which need to be on their own paragraph for them to have an effect.

#### Headings

For headings, use a single hashtag followed by a space, then the content of the heading:
```
# Heading
```

> ## Heading

For subheadings, use two hashtags in the same manner:

```
## Subheading
```
> ### Subheading

#### Images

For images, use the following pattern:

```
!\[Black is beautiful.](https://res.cloudinary.com/wokeweekly/image/upload/v1576524060/public/bg/header-home.jpg)
```
<img src="https://res.cloudinary.com/wokeweekly/image/upload/v1576524060/public/bg/header-home.jpg" alt="Black is beautiful." style="width: 50%" />

#### Lists

For bullet lists, surround your list with `::ul` and `::end` and include a plus sign at the beginning of every list item as follows:

```md
::ul
+ Black Panther
+ Luke Cage
+ Storm
::end
```

<blockquote>
  <ul>
    <li>Green Lantern</li>
    <li>Static Shock</li>
    <li>Vixen</li>
  </ul>
</blockquote>

`ul` stands for unordered list. If you want there to be more of a "block" space between each time, use `::ulb` instead like so:

```
::ulb

+ Green Lantern, John Stewart is a Black superhero from the DC universe with the power of sheer will infused in the Power Ring he wears on his finger.

+ Static Shock is a Black teenage superhero from Dakota with the power of electromagnetism at his fingertips.

+ Vixen is a Black superheroine who wields the Tantu Totem, allowing her channel the intrinsic abilities of all beasts of nature.

::end
```

<blockquote>
  <ul>
    <li style="padding: .5em 0">Green Lantern, John Stewart is a Black superhero from the DC universe with the power of sheer will infused in the Power Ring he wears on his finger.</li>
    <li style="padding: .5em 0">Static Shock is a Black teenage superhero from Dakota with the power of electromagnetism at his fingertips.</li>
    <li style="padding: .5em 0">Vixen is a Black superheroine who wields the Tantu Totem, allowing her channel the intrinsic abilities of all beasts of nature.</li>
  </ul>
</blockquote>

<!-- TODO: Add numbered lists -->
<!-- TODO: Add hyphenated list -->
<!-- TODO: Add block quotes -->

#### Social Media Embeds

To embed a tweet from Twitter into your content, retrieve the ID of the tweet you want to embed (the long number at the end of the tweet's URL) and enter the expression in the pattern:
`!{Tweet}(tweet-id)`. For example:

```
!{Tweet}(1250122883101327361)
```

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">SUBSCRIBE to our YouTube channel via the LINK IN OUR BIO for upcoming video and audio content! 🎉🤩<a href="https://t.co/bONuy27dlM">https://t.co/bONuy27dlM</a></p>&mdash; #WOKEWeekly® (@wokeweeklyuk) <a href="https://twitter.com/wokeweeklyuk/status/1250122883101327361?ref_src=twsrc%5Etfw">April 14, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

To embed an Instagram post, retrieve the full URL of the post and enter the expression in the pattern: `!{Insta}(ig-post-url)`. For example:

```
!{Insta}(https://www.instagram.com/p/CCBnPxupx6J)
```

<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/CCBnPxupx6J/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="12" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/CCBnPxupx6J/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;"> View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div></a> <p style=" margin:8px 0 0 0; padding:0 4px;"> <a href="https://www.instagram.com/p/CCBnPxupx6J/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#000; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none; word-wrap:break-word;" target="_blank">We’re kept afloat by the work and support of a lot of beautiful people. Are you familiar with our members? Check out their profiles over on our team page! Check the link in our bio ——————————————————— #teammembers #teamwork #community #blackcommunity #support #work #team #family</a></p> <p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;">A post shared by <a href="https://www.instagram.com/wokeweeklyuk/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px;" target="_blank"> #WOKEWeekly®</a> (@wokeweeklyuk) on <time style=" font-family:Arial,sans-serif; font-size:14px; line-height:17px;" datetime="2020-06-29T16:10:26+00:00">Jun 29, 2020 at 9:10am PDT</time></p></div></blockquote> <script async src="//www.instagram.com/embed.js"></script>

#### Other

For horizontal lines / dividers, use the triple hyphens or underscores:

```
Black is beautiful.
---
...and it always will be.
```

<blockquote>
  Black is beautiful.
  <hr>
  ...and it always will be.
</blockquote>
# Rich-Text Formatting

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
> <ins>Black is beautiful.<ins>

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

<blockquote>
  <h2>Heading</h2>
</blockquote>

For subheadings, use two hashtags in the same manner:

```
## Subheading
```
<blockquote>
  <h3>Subheading</h3>
</blockquote>

#### Images

For images, use the following pattern:

```
!\[Black is beautiful.](https://res.cloudinary.com/wokeweekly/image/upload/v1576524060/public/bg/header-home.jpg)
```
<img src="https://res.cloudinary.com/wokeweekly/image/upload/v1576524060/public/bg/header-home.jpg" alt="Black is beautiful." />

#### Bullet Lists

For bullet lists, surround your list with `::ul` and `::end` and include a plus sign at the beginning of every list item as follows:

```md
::ul
+ Green Lantern
+ Static Shock
+ Vixen
::end
```

<blockquote>
  <ul>
    <li>Green Lantern</li>
    <li>Static Shock</li>
    <li>Vixen</li>
  </ul>
</blockquote>

`ul` stands for unordered list. If you want there to be more of a "block" space between each item, use `::ulb` instead like so:

```
::ulb

+ Green Lantern, John Stewart is a Black DC superhero from the DC universe with the power of sheer will infused in the Power Ring he wears on his finger.

+ Static Shock is a Black teenage DC superhero from Dakota with the power of electromagnetism at his fingertips.

+ Vixen is a Black DC superheroine who wields the Tantu Totem, allowing her channel the intrinsic abilities of all beasts of nature.

::end
```

<blockquote>
  <ul>
    <li>
      <p>
        Green Lantern, John Stewart, is a Black superhero from the DC universe with the power of sheer will infused in the Power Ring he wears on his finger.
      </p>
    </li>
    <li>
      <p>
        Static Shock is a Black teenage superhero from Dakota with the power of electromagnetism at his fingertips.
      </p>
    </li>
    <li>
      <p>
        Vixen is a Black superheroine who wields the Tantu Totem, allowing her channel the intrinsic abilities of all beasts of nature.
      </p>
    </li>
  </ul>
</blockquote>

#### Numbered Lists

For numbered lists, surround your list with `::olb` and `::end` and include a number followed by a decimal point at the beginning of every list item as follows:

```md
::ol
1. Black Panther
2. Luke Cage
3. Storm
::end
```
<blockquote>
  <ol>
    <li>Black Panther</li>
    <li>Luke Cage</li>
    <li>Storm</li>
  </ol>
</blockquote>

`ol` stands for ordered list. If you want there to be more of a "block" space between each item, use `::olb` instead like so:

```md
::olb

1. Black Panther is a Black Marvel superhero and the king of Wakanda, a hidden city in Africa known for its ample supply of vibranium.

2. Luke Cage is a Black Marvel superhero known for his superhuman strength and nigh-invulnerability.

3. Storm is a Black Marvel superheroine and a veteran member of the X-Men. She wields the power of flight and weather manipulation.

::end
```
<blockquote>
  <ol>
    <li>
      <p>
        Black Panther is a Black Marvel superhero and the king of Wakanda, a hidden city in Africa known for its ample supply of vibranium.
      </p>
    </li>
    <li>
      <p>
        Luke Cage is a Black Marvel superhero known for his superhuman strength and nigh-invulnerability.
      </p>
    </li>
    <li>
      <p>
        Storm is a Black Marvel superheroine and a veteran member of the X-Men. She wields the power of flight and weather manipulation.
      </p>
    </li>
  </ol>
</blockquote>

<!-- TODO: Add hyphenated list -->
<!-- TODO: Add block quotes -->

#### Social Media Embeds

To embed a tweet from Twitter into your content, find the ID of the tweet you want to embed, which is the last number of the URL.

For example, we want to embed the tweet in the following URL:
https://twitter.com/wokeweeklyuk/status/1250122883101327361.

The number, `1250122883101327361`, is the tweet ID.
Using this ID, we can enter an expression in the pattern:
`!{Tweet}(tweet-id)`. For example:

```
!{Tweet}(1250122883101327361)
```

To embed an Instagram post, retrieve the full URL of the post and enter the expression in the pattern: `!{Insta}(ig-post-url)`. For example:

```
!{Insta}(https://www.instagram.com/p/CCBnPxupx6J)
```

#### Other

For horizontal lines / dividers, use the triple hyphens or underscores:

```
Black is beautiful.
---
...and it always will be.
```

<blockquote>
  <p>Black is beautiful.</p>
  <hr>
  <p>...and it always will be.</p>
</blockquote>
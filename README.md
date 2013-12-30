polymovial
===

polymovial is a mathematical experiment. It's a tiny JavaScript library, intended to be used in a browser (so far). It can help track and predict user's mouse movement. Instead of sending every exact point the mouse pointer has moved over to a backend system, it utilises user's computer resources and can do two things:

1. approximate mouse movement by finding a fitting curve
2. predict if user would have moved their mouse pointer towards / over a rectangular area on the page, for example a banner

Reason
---

Sending every mouse pointer position to a backend system and doing computation there can be expensive, slow and occasionally unreliable. Doing this in user's browser by approximating the movement curve can ease this by moving computation to user's computer and reporting only relevant information to a backend system.

Functionality
---

polymovial doesn't separate between "user has actually moved over a banner" and "user would have moved over a banner". If the banner is in the curve's way with some configurable tolerance, it's considered success (a view).

Math
---

polymovial has "poly" in its name, sounds similar to "polynomial" for my non-native speaker's ears and thus utilises polynomials. The mouse movement function itself is a polynomial and is approximating mouse movements. Then it tries to find the general movement curve and predict movements through testing for intersection of the curve with a rectangular area.

So the corresponding math is:

1. find a polynomial function fitting the mouse movement over the most recent points (learn). Correlation coefficient as well as standard error are computed, too. The quality of fitting and thus the standard error depend on the selected polynomial degree, tolerance and the size of the buffer collecting tracked points. Beware of overfitting and computation complexity though. Also, computation of the polynomial coefficients disregards the order in which the mouse pointer moved over tracked pixels
2. find out if this function crosses / touches one of the four lines' segments representing the rectangle in question. To find polynomial roots, Jenkins-Traub algorithm (RPOLY) is used. Intersection with two sides of the rectangle is based , with the other two sides on simply computing the function value at X. Theoretically, every pixel on rect's boundaries could be tested through the polynomial regression, but this would be much more expensive, and from what I see, isn't necessary for the rectangular shape with two sides parallel to the X axis.

Thus, it can be considered a sort of binary learner / predictor.

Usage
---

The polymovial constructor takes 4 parameters:

- object id - where to hang the onmouseover event listener in
- capacity - will be aligned up to the next power of two and defines how many points will be collected. Internally, the points collection is a circular buffer, so the given capacity will never be exceeded
- polynomial degree. Odd numbers can be tricky though. They are likely to produce complex numbers, so only those that hav imaginary part = 0 are taken into account when solving the equotion. This can lead to misprediction when trying to predict crossing / touching rectangle's boundaries
- tolerance - how many pixels away from the banner boundaries are still considered as "view". Human eyes / brain are able to catch visual information outside eyes' focus, so this is the value to play with
- matf - the object obtained by including 'matrix_processor.js'

From here, mouse movement over the given object will be tracked. To obtain the polynomial of mouse movement, function `obtainPolynomial` needs to be called. It computes the polynomial based on the recent tracked mouse pointer movement points. It returns the coefficients in the reverse order, like `[a0, a1, a2, ..., aN]`.

To make a prediction based on the learned polynomial, `checkIntersection` needs to be called, with these parameters:

- object id - target banners object id
- polymovial object returned by `obtainPolynomial`

It simply returns true / false as binary prediction result.

Example
---

Provided example simply recomputes the polynomial every 5 seconds, as well as makes a prediction of whether a pseudo-banner on the right would have been crossed / touched.

Usage scenarios
---

Basically, polymovial can help optimize ad banner, product ad etc. placement on the page or simply observe placement's effectiveness not buy checking the exact view or click, but by predicting if user could have seen it by following their mouse pointer. Of course, if user moves their mouse pointer towards a banner, it's more likely to be seen / clicked than if they never move it there. Also, placing ads along movement curves can increase the chance of the click, since many of us use to follow the mouse pointer with our eyes and some of us use to randomly move the mouse over the page while trying to find out if it's interesting / relevant, or to find useful information.

Both pieces of functionality polymovial provides can be used separately. If it's only about collecting movement functions for future ad placement, it's not necessary to predict if it would have crossed any banner's boundaries. If these boundaries are known beforehand and the effectiveness of placement needs to be observed, the other piece of functionality can also be used.

More scenarios are surely possible.

Theoretically, it would be possible to predict if movement curve would cross any shape, not only rectangular ones. This can be done by deriving a polynomial function from the shape or by describing this shape as polynomial function beforehand and checking for intersection then. This check would be a bit trickier though.

"Borrowed" code
---

Obtaining polynomial coefficients is done through a sub-library of [polysolve](http://www.arachnoid.com/polysolve/). Predictor is based on the code from the [root-finder based on RPOLY JavaScript implementation](http://www.akiti.ca/PolyRootRe.html).

TODOs
---

- as any predictor that tries to predict human behaviour, polymovial is not exact. When user wildly / randomly moves their mouse pointer around, predictor will mispredict. Also, when for example a laptop vibrates so bad that the table the mouse is on also vibrates, mouse pointers sometimes introduce visual vibration, too. polymovial will mispredict in this case, too. Maybe I will invest some time into trying to recognize these patterns
- instead of expecting a fix polynomial degree, some more learning could be applied to learn from the points and to find an optimal degree. Beware of overfitting though
- the JavaScript part is yet very simple. It expects a visually uncovered object to track mouse pointer movents upon. A web page will be much more complex than that, so tracking should be done recursively on all children of the given object, with respect to coordinates. Also, page scrolling / position isn't being taken into account yet at all
- it might be necessary to sample mouse pointer movements to allow longer paths to be used to obtain the polynomial. Due to the nature of the circular buffer in use, the polynomial is obtained only from the recent N points. Sampling would make the function more unprecise, but a longer movement path could help make a better prediction. Sampling can be as simple as "take every 10th point"
- predictor should take standard error into consideration
- predictor should be able to reset the tracked points after making a prediction. Right now, polymovial keeps tracking no matter what, only constrained by the size of the circular buffer
- write some tests for well known paths to continuously check for correctness

Feedback, contribution etc.
---

To be honest, compared to what I've seen from people who work on it all day long, my skills in scripting a browser page are pretty limited (or at least I didn't want to spend too much time yet to make it runnable in every possible browser). So I don't claim it will work in every browser or on every page. Any feedback or contribution is welcome to improve that part. Also, my math might have flaws, and a long-time math expert might have millions of alternatives for my approach. So, again, feedback and contribution are more than welcome - I'm more interested in learning math to be honest. A friend of mine already recommended spline interpolation to me, but without sufficient context, so I first need to look at it at all and to see how it fits in here.

License
---

I couldn't find license information on every single piece of code I've "borrowed", and those I found are published under the GPL. So I decided to publish polymovial under the GPL v3.

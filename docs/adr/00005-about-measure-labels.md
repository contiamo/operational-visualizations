The visualization library contains a `Labels` component, which can be used in the same way as all other axial chart renderers:

```
<Chart>
  <Bars ... />
  <Labels ... />
</Chart>
```

However, the user can also display labels by passing a `displayLabels` flag. This solves multiple problems:

- In the case of stacked bars or area charts, using the above API does not take stacking into account, so the labels will be in the wrong places.

- The `Labels` component only works for axial charts, not for pie charts, so `PieChart` would have needed a flag anyway - this ensures consistency across all renderers.

- For scatter plots, the labels are now automatically offset by the radius of the dots. Any other renderer-specific styling that may be required is now also easier.

# Limiting the size of your cache

If you fear your cache will keep growing, you have some options to make sure it doesn't get too big.

First, you can use the `clearCache` method to empty all stored data, or just a service's items. You might want to implement a button in your interface to give your users the ability to clear it whenever they want if they feel like their app is starting to take too much space.

The other solution would be to use the capping option. If you set `capServices` to true in your [API options](#api-options), or `capService` in your [service options](#services-options), the wrapper will make sure it never stores more items that the amount you configured in `capLimit`. This is a good way to restrict the size of stored data for sensitive services, while leaving some of them uncapped. Capping is disabled by default.
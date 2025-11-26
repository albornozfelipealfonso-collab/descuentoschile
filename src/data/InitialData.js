
export const initialData = {
  bancos: [
  {
    "id": 1,
    "nombre": "Banco Estado",
    "color": "#2E7D32",
    "logo_url": "data:image/png;base64,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",
    "activo": true
  },
  {
    "id": 2,
    "nombre": "Banco de Chile",
    "color": "#1976D2",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 3,
    "nombre": "Banco Santander",
    "color": "#D32F2F",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 4,
    "nombre": "BCI",
    "color": "#F57C00",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 5,
    "nombre": "Scotiabank",
    "color": "#c53916",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 6,
    "nombre": "Banco Itaú",
    "color": "#FF5722",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 7,
    "nombre": "Banco Security",
    "color": "#388E3C",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 8,
    "nombre": "Banco Falabella",
    "color": "#E91E63",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 9,
    "nombre": "Tenpo",
    "color": "#333333",
    "logo_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAA5FBMVEUAAAD///9q/5nY2NiLi4uu/Mds/Zlk/pFo/5bh/udm/JWysrJgYGBq/5oaGhqSkpItLS2FhYWbm5tr/6Cjo6Pm5uZxcXEBAQDx8fG7u7sjIyN8fHyYmJjQ0NA2NjZp/p7FxcVYtHZw7ZBz/6RBfFRZWVmcsaJEiFkhQyoPDw9l35AqKipv65QoTzU8gFQ9eFIhQS4PHBVezX1BQUFQnGwvXD5q3Ytky4RHlF0iLScOGhXg++3V29QAEQBOo2xbvn0fOyo2aUNgyHwHEAsXKh4iUTBf1o2u8cQNAA4gMSZJkWg2Y0T47J4fAAAF7UlEQVR4nO2dbVvbNhSGZaUTKUUUaoIJFBwSMiALLV0orN3GS+noOv7//5mcNNSJZUmWhWPleu7vPZdudHxkHTkqIQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIuh/6bd6fx6fOIuYrS21W40Gp2ttVN3Qa3Z2gkSXtLe4MhNxN1Xk5AJO+3f3AS1Zm86lJerTRoOz0hUOuTbYJYtB8O0px2kDBnn4bvSIfeDeRrrDkZqx0ErSBvGrMnD9yVjNjKCQdByMloL9tKjSLI0oVcuUTsSQTGLzsZciHYgMeS0d14i5p5UMAjeOBu1OekMTc8hj7sf7KPuyAWDYNfdyA3ZnB/C1JA2wwGxTdS8KVxAQc0+Lk+GlIe/24bN1tEpOy5Hr2fUyg7hyZDRZnxoGThXMAgOnBpoeCEbwc85FInKLqwSdaQw3HTvkUckL+hpQ7pityxuKwyrq6brkgydN+Scxh8tYmfKV4pXzk3yyKvnM3MoEtVmWZSmf9WGudVuzpA2h/eFg9fBMH/BmjdkzcvC1aYOhrnvHBlDSsOrotFrYKgodlnDZlh0WayBYTt/BFlDxsI/ioWvgWHOSiE3TLZSxfoaNTBUjEBqyNjHItXGQ0PK2acC4X00pLTIbtFLQx4XWBa9NBR5ar4s+mlIqflu0VdDarws+mrIqelu0VdDatxE9dfQtInqr6Fw7H42CO+zoVkT1WdDsyaqz4ZmTVSfDRPJ8IJE6kT13FA8i7pl0XPDVdpkmiZqvQ3/XNHNYdJEva254bpiBH8N9IaMDpVfj9TbcP/vIdcZcsYvbQ2rOUBUGTbISahVnDRRcwuqyrCakxm1ITlisdZxVdVErb0huWb6R1HVRK2/IblhekdFE9UDQ3LJDaaR5y2L9TeMyIehfg6FY04Ttf6GgvOQc1254XlNVC8MyV24op3DcRPVU0Oxebhg+pcbGkubqD4YJoiCqi830mXRF0NyabBkSJuonhhG5LSrXzOkTVRPDAW3PYNHkYaZJqo/hqKgGhjyTBPVI0NybKQ430RVGb6tmSE5NHh9yzRRVYav62ZIrgwKKg+/zPybxRtuFDC8H2j3imz+kxu/DMluLzaYxpkmqmeG5JHFesOZL1F9MyTHPa3gbBPVO0NyHXLDJmrkpaEY9ReDfQajT1+i+maYMNQbppqoPhp+HXKTrdSPJqqHhhE5C5v6PvH0bNFHw4gcGbyhTpuoHhomXIdNqk/UcRPVU0NyY3KeMW6i+mkoKsggNNgQM/bJU0OSFFS9oGB4r/rNTK0NyT89gzyl/MHbOYzInf4NVaz8K998NRSYtInZyi+K+C8qMVyzNiQ3jOoyVW1Yze8PSxiSS/2W33PDf7tNzbrvt6FYFc91LzZ+Gybo2sT+G5LjkKkeRu8NRaIexsovNH03TBQfVN03/w0ThorT02UwjMj3Xv6WfxkMheJjuNRzmHAccra61IbkMMzp9i+NIbnKadssjyHJOXdbIsPvXelOaokMyZn0DXWZDMmRrBO+VIbkWlJO1YZ7z+Q0iztDcpVVVBv2n0dpDoeGoqBm7tFQGj6LUAZnhmKb8bU7vyoqDSu6V9DlHGYLqtKwmmaiU8OIvO/N9qZUhlVdSOfWcHzuZmhYTSV1nKVRcu5maNh+DhsZKsN9m4APcarbn29oFdsK1a1/HZuAp+lvNXINK5tBMSCFoc3vAyNyknp9yzOs6hkcozC0LOd3vaceqtywVemll4r7Ra1v3/wvnq4ZUsPqrkuckH8MbblgRamviWWGlWbomNw790oc0U7bxFnDxoa7kZvy2u0Ujvnc5XLDqjN0guxCccF2mZi3TGpYfYaOWZfmackfWj+OvymaNWxVf7/1mIgcSBRLp9O7cN5wMRk6YTeTqA4+BHlkbMawVNaXZ3NmGvfLL8lizTg9ZD8N24v/fzu2Oz8kW1sj6wvY57i9GHybhFzAGiFjo9/vj9z9rcd/pdNRf+QsIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXPM/NHV95xiRWF0AAAAASUVORK5CYII=",
    "activo": true
  },
  {
    "id": 10,
    "nombre": " Líder BCI Mastercard",
    "color": "#1b61ac",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 11,
    "nombre": "MACH",
    "color": "#b440f2",
    "logo_url": "data:image/png;base64,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",
    "activo": true
  },
  {
    "id": 12,
    "nombre": "Dale Coopeuch",
    "color": "#5d83d0",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 13,
    "nombre": "Banco Ripley",
    "color": "#818898",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 14,
    "nombre": "Tarjeta Spin Cruz Verde",
    "color": "#37ae65",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 15,
    "nombre": "Cencosud",
    "color": "#274a91",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 16,
    "nombre": "sbpay",
    "color": "#262627",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 17,
    "nombre": "Coopeuch",
    "color": "#a32424",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 18,
    "nombre": "Los Heroes",
    "color": "#7d4d17",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 19,
    "nombre": "Banco Bice",
    "color": "#6aaad2",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 20,
    "nombre": "Hites",
    "color": "#0f131a",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 21,
    "nombre": "Abc",
    "color": "#1d2025",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 22,
    "nombre": "Banco Internacional",
    "color": "#4075dd",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 23,
    "nombre": "Banco Consorcio",
    "color": "#082d77",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 24,
    "nombre": "WOM",
    "color": "#6033a3",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 25,
    "nombre": "Entel",
    "color": "#1924be",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 26,
    "nombre": "Movistar",
    "color": "#129121",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 27,
    "nombre": "Claro",
    "color": "#f32112",
    "logo_url": "",
    "activo": true
  },
  {
    "id": 28,
    "nombre": "Copec Pay",
    "color": "#2f61c6",
    "logo_url": "",
    "activo": true
  }
],
  descuentos: [
  {
    "id": 10,
    "establecimiento": "Cinepolis",
    "descripcion": " 2x1 en entradas en Cinépolis",
    "descuento": " 2x1 en entradas ",
    "banco_nombre": " Líder BCI Mastercard",
    "tipo_tarjeta": "credito",
    "categoria": "Cine",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": false,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 11,
    "establecimiento": "Pedidosya",
    "descripcion": "40%",
    "descuento": "30%",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "debito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "2025-07-24",
    "activo": true
  },
  {
    "id": 12,
    "establecimiento": "Lipigas",
    "descripcion": "20% de descuento en Lipigas",
    "descuento": "20% de descuento en Lipigas",
    "banco_nombre": " Líder BCI Mastercard",
    "tipo_tarjeta": "credito",
    "categoria": "Gas",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": false,
    "terminos": "",
    "fecha_vencimiento": "2025-07-31",
    "activo": true
  },
  {
    "id": 13,
    "establecimiento": "Uber Eats",
    "descripcion": "40% de descuento para los miembros de Uber One que compren en todos los restaurantes de la app (tope de $2.000 por pedido). Mientras que los usuarios no suscritos obtendrán un 30% rebaja y tendrán un límite de $1.500 de descuento por pedido. Si quieres acceder a esta oferta tienes que descargar los cupones disponibles en la sección de beneficios de la App Movistar.",
    "descuento": "40% de descuento",
    "banco_nombre": "Movistar",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 14,
    "establecimiento": "Rappi",
    "descripcion": "30% de descuento en toda la aplicación de Rappi, con un tope de $5.000 de rebaja.",
    "descuento": "30% de descuento",
    "banco_nombre": "sbpay",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 15,
    "establecimiento": "Uber Eats",
    "descripcion": "Usuarios De Uber One recibirán $6.000 de rebaja en el próximo pedido en Streat Burger, usando el código CPONE25JUL. Mientras que los miembros sin suscripción obtendrán $3.000 de descuento aplicando el cupón CP25JUL. En ambos casos el beneficio es válido en compras sobre los $15.000 y se puede usar una sola vez al mes.",
    "descuento": "$6.000 ",
    "banco_nombre": "Copec Pay",
    "tipo_tarjeta": "debito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 16,
    "establecimiento": "PedidosYa",
    "descripcion": "30% de descuento en la categoría restaurantes al pagar con las tarjetas de crédito del Banco Ripley. Tope de descuento de $4.000 y solo una compra al mes por cada usuario. Para aprovechar la promoción deberás ingresar el código RIPLEYJUL25.",
    "descuento": "30% de descuento",
    "banco_nombre": "Banco Ripley",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 17,
    "establecimiento": "PedidosYa",
    "descripcion": "30% de descuento en todas las categorías al pagar con la tarjeta Sbpay Visa. Este beneficio es válido en máximo dos compras con descuento al mes, con tope de $5.000, y aplicando el cupón SBPAYJUL25.",
    "descuento": "30% de descuento",
    "banco_nombre": "sbpay",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 18,
    "establecimiento": "PedidosYa",
    "descripcion": "Todos los días es posible acceder a un 40% de descuento en Pizzerías, aplicando el cupón MACHPIZZA07. El beneficio tiene un uso mensual al pagar con la tarjeta de crédito MACHBANK",
    "descuento": " 40% de descuento en Pizzerías",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 19,
    "establecimiento": "PedidosYa",
    "descripcion": "40% de descuento en toda la app, con un tope de $5.000. Oferta válida al pagar con la tarjeta de crédito MACHBANK en hasta cinco usos al mes.",
    "descuento": " 40% de descuento ",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 20,
    "establecimiento": "PedidosYa",
    "descripcion": "30% OFF en categoría de Mascotas. Este beneficio se puede usar una vez al mes y tiene un tope de $10.000 al pagar con el botón de pago MACHBANK.",
    "descuento": "30% OFF en categoría de Mascotas.",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 21,
    "establecimiento": "PedidosYa",
    "descripcion": "Todos los días de julio se puede aprovechar de un 30% OFF en toda la app, aplicando el cupón BICEPEYA072025. Este beneficio permite solo dos compras mensuales y con un límite de $4.000 de rebaja.",
    "descuento": "30% OFF ",
    "banco_nombre": "Banco Bice",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 22,
    "establecimiento": "PedidosYa",
    "descripcion": "30% de descuento en l a categorías Mascotas. Este beneficio tiene un tope de $10.000 y se puede usar una sola vez desde el 21 al 27 de julio.",
    "descuento": "30% de descuento en l a categorías Mascotas",
    "banco_nombre": "BCI",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 23,
    "establecimiento": "PedidosYa",
    "descripcion": "20% o 30%(usuario plus) de descuento en PedidosYa Market al pagar con las tarjetas de crédito del Banco Bci. Válido en dos compras mensuales y con un tope de $15.000 de rebaja.",
    "descuento": "20% de descuento en PedidosYa Market, 30% PLUS",
    "banco_nombre": "BCI",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 24,
    "establecimiento": "PedidosYa",
    "descripcion": "40% de descuento en Pizzerías, pagando con las tarjetas de crédito del Banco Bci. En este caso la oferta es válida para una sola compra mensual al usar el cupón BCIPIZZA07 y tiene un tope de rebaja de $5.000.",
    "descuento": "40% de descuento en Pizzerías,",
    "banco_nombre": "BCI",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 25,
    "establecimiento": "PedidosYa",
    "descripcion": "Se puede obtener 30% de descuento al aplicar el cupón SCOTIABANKJUL25. En este caso, la oferta sirve para una sola compra al mes, con tope de $4.000 y para clientes que usen sus tarjetas de débito o de crédito Visa Scotia Infinite, Singular, Signature o Wealth Management.",
    "descuento": "30% de descuento ",
    "banco_nombre": "BCI",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "miércoles"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 26,
    "establecimiento": "PedidosYa",
    "descripcion": "40% de descuento en Just Burger. Se puede usar en una compra al día con tope de $7.000 y es necesario emplear estos cupones:\nLunes 07/07: BCHJB070725\nLunes: 14/07: BCHJB140725\nLunes 21/07: BCHJB210725\nLunes 28/07: BCHJB280725",
    "descuento": "40% de descuento en Just Burger",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 27,
    "establecimiento": "Rappi",
    "descripcion": "25% OFF en la categoría \"Mascotas\" al pagar con las tarjetas del Banco de Chile. Este beneficio se puede usar en una compra al día, con un tope de $10.000 de descuento.",
    "descuento": "25% OFF en la categoría \"Mascotas\"",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 28,
    "establecimiento": "Rappi",
    "descripcion": "30% de rebaja en restaurantes, con un tope de $4.000 de descuento.",
    "descuento": "30% de rebaja en restaurantes",
    "banco_nombre": "Banco Bice",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 29,
    "establecimiento": "Uber Eats",
    "descripcion": "40% de descuento para los miembros de Uber One que compren en Burger King y Burger King Vegetal (tope de $2.000 por pedido). Mientras que los usuarios no suscritos obtendrán un 30% rebaja y tendrán un límite de $1.500 de descuento por pedido. Si quieres acceder a esta oferta tienes que descargar los cupones disponibles en la sección de beneficios de la App Movistar.",
    "descuento": "40% de descuento para los miembros de Uber One que compren en Burger King y Burger King Vegetal ",
    "banco_nombre": "Movistar",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 30,
    "establecimiento": "Rappi",
    "descripcion": "25% de descuento en Subway. Tope de $10.000 de rebaja.",
    "descuento": "25% de descuento en Subway.",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "martes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 31,
    "establecimiento": "Rappi",
    "descripcion": "Usuarios Pro tendrán un 30% de descuento en la categoría Turbo y Turbo Restaurantes. Tope de $4.000.",
    "descuento": "30% de descuento en la categoría Turbo y Turbo ",
    "banco_nombre": "Banco Bice",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "martes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 32,
    "establecimiento": "Rappi",
    "descripcion": "40% OFF en la categoría de Sushi y Hamburguesa. Esta oferta está destinada a los usuarios Pro y tiene un límite de $8.000. Para usar la promoción es necesario indicar los siguientes códigos:\nMartes 8 de julio: ITAU8JUL\nMartes 15 de julio: ITAU15JUL\nMartes 22 de julio: ITAU22JUL\nMartes 29 de julio: ITAU29JUL",
    "descuento": "40% OFF en la categoría de Sushi y Hamburguesa",
    "banco_nombre": "Banco Itaú",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "martes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 33,
    "establecimiento": "Rappi",
    "descripcion": "40% de descuento en la categoría de mascotas y existe un tope de $5.000.",
    "descuento": "40% de descuento en la categoría de mascotas ",
    "banco_nombre": "Coopeuch",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "martes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 34,
    "establecimiento": "PedidosYa",
    "descripcion": "30% de rebaja en cafeterías seleccionadas de la aplicación. Esta promoción ofrece un tope de $7.000 de descuento.",
    "descuento": "30% de rebaja en cafeterías",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "martes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 35,
    "establecimiento": "PedidosYa",
    "descripcion": "Los martes de julio existe un 40% OFF en PedidosYa Market, en una sola compra al mes y con un tope de $3.000 de descuento. La oferta está dirigida para los usuarios Plus que paguen usando el botón de pago MACHBANK.",
    "descuento": "40% OFF en PedidosYa Market",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "martes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 36,
    "establecimiento": "PedidosYa",
    "descripcion": "40% de rebaja en una compra al mes en Frutas y Verduras. El tope de esta promoción es de $3.000 y es exclusiva para los miembros Plus.",
    "descuento": "40% de rebaja en una compra al mes en Frutas y Verduras",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "martes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 37,
    "establecimiento": "Uber Eats",
    "descripcion": "40% de descuento al comprar en McDonald's en compras de mínimo $10.000. Este beneficio tiene un tope de rebaja de $5.000 y es necesario emplear los siguientes códigos:\n8 de julio: BCHMCD25JUL2\n15 de julio: BCHMCD25JUL3\n22 de julio: BCHMCD25JUL4\n29 de julio: BCHMCD25JUL5",
    "descuento": "40% de descuento al comprar en McDonald's",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "martes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 38,
    "establecimiento": "Uber Eats",
    "descripcion": "\t40% de descuento para los miembros de Uber One que compren en Subway (tope de $2.000 por pedido). Mientras que los usuarios no suscritos obtendrán un 30% rebaja y tendrán un límite de $1.500 de descuento por pedido. Si quieres acceder a esta oferta tienes que descargar los cupones disponibles en la sección de beneficios de la App Movistar",
    "descuento": "\t40% de descuento para los miembros de Uber One que compren en Subway ",
    "banco_nombre": "Movistar",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "martes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 39,
    "establecimiento": "Uber Eats",
    "descripcion": "\tLos miembros de Uber One tendrán un 40% de rebaja en los locales habilitados de McDonald's en Uber Eats, con un descuento máximo de $4.000 por pedido. Mientras que los usuarios que no estén suscritos obtendrán un 30% OFF y un tope de $3.000 de ahorro por pedido.",
    "descuento": "\tLos miembros de Uber One tendrán un 40% de rebaja en los locales habilitados de McDonald's en Uber Eats",
    "banco_nombre": "Movistar",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "martes",
      "miércoles"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 40,
    "establecimiento": "Rappi",
    "descripcion": "25% de rebaja en Rappi Turbo. Este beneficio es válido al usar las tarjetas de crédito o débito del Banco de Chile y en una compra al día, con un tope de $10.000 de descuento.",
    "descuento": "25% de rebaja en Rappi Turbo",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "miércoles"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 41,
    "establecimiento": "Rappi",
    "descripcion": "Los clientes recibirán un 30% de descuento en McDonald's. El tope de rebaja es de $4.000.",
    "descuento": "30% de descuento en McDonald's.",
    "banco_nombre": "Banco Bice",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "miércoles"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 42,
    "establecimiento": "PedidosYa",
    "descripcion": "30% de descuento en botillerías seleccionadas. El límite de rebaja para esta promoción es de $7.000 y un descuento por día.",
    "descuento": "30% de descuento en botillerías seleccionadas",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "miércoles"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 43,
    "establecimiento": "PedidosYa",
    "descripcion": "Al pagar con el botón de pago de MACHBANK se puede obtener un 30% de descuento en la categoría Mascotas. Este beneficio es válido en una compra mensual y tiene un límite de $3.000 de rebaja.",
    "descuento": "30% de descuento en la categoría Mascotas.",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "miércoles"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 44,
    "establecimiento": "Uber Eats",
    "descripcion": "30% de descuento al pagar con las tarjetas de Banco de Chile y Edwards en una compra semanal en los restaurantes habilitados en la app. Este beneficio entrega un descuento máximo de $6.000 en pedidos iguales o sobre los $15.000. Para esto deberás usar los siguientes códigos:\n9 de julio: BCH25JUL2\n16 de julio: BCH25JUL3\n23 de julio: BCH25JUL4\n30 de julio: BCH25JUL5",
    "descuento": "30% de descuento restaurantes ",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "miércoles"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 45,
    "establecimiento": "Uber Eats",
    "descripcion": "Los miembros de Uber One tendrán un 40% de rebaja en los locales habilitados de Melt Pizzas en Uber Eats, con un descuento máximo de $2.000 por pedido. Mientras que los usuarios que no estén suscritos obtendrán un 30% OFF y un tope de $1.500 de ahorro por pedido.",
    "descuento": " 40% de rebaja en los locales habilitados de Melt Pizzas en Uber Eat",
    "banco_nombre": "Movistar",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "miércoles"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 46,
    "establecimiento": "Rappi",
    "descripcion": "25% OFF en categoría Express, pagando con la tarjeta de crédito o débito del Banco de Chile. Este beneficio es válido en una compra al día, con un tope de $10.000 de descuento.",
    "descuento": " 40% de rebaja en los locales habilitados de Melt Pizzas en Uber Eat",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "jueves"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 47,
    "establecimiento": "Rappi",
    "descripcion": "Durante julio, los usuarios Pro pueden obtener un 30% de descuento en el delivery de restaurantes. Tope de $4.000.",
    "descuento": "30% de descuento",
    "banco_nombre": "Banco Bice",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "lunes",
      "miércoles",
      "domingo",
      "viernes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 48,
    "establecimiento": "Rappi",
    "descripcion": "40% de rebaja en la categoría Restaurantes para los usuarios Pro de la plataforma que paguen con su tarjeta de crédito. Tope de $8.000 de descuento.",
    "descuento": "40% de rebaja en la categoría Restaurantes para los usuarios Pro ",
    "banco_nombre": "Banco Itaú",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "jueves"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 49,
    "establecimiento": "PedidosYa",
    "descripcion": "30% de rebaja en sushis seleccionados. Tope de $7.000 y una compra diaria.",
    "descuento": "30% de rebaja en sushis seleccionados.",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "jueves"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 50,
    "establecimiento": "PedidosYa",
    "descripcion": "Los jueves del mes existe un 30% de rebaja al comprar en botillerías con el botón de pago de MACHBANK. En este caso, la promoción se puede usar una sola vez al mes y tiene un tope de $3.000 de ahorro.",
    "descuento": "30% de rebaja al comprar en botillería",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "jueves"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 51,
    "establecimiento": "PedidosYa",
    "descripcion": "40% de descuento en Carnicerías para los Usuarios Plus. Tope de $3.000 de descuento y válido solo una vez al mes.",
    "descuento": "40% de descuento en Carnicerías",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "jueves"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 52,
    "establecimiento": "UberEats",
    "descripcion": "Los días jueves de julio, tendrás $10.000 descuento en restaurantes . La oferta está disponible al pagar con la tarjeta Cencosud Scotiabank en compras sobre los $15.000 y se deben emplear los siguientes cupones:\nJueves 10 de julio: CENCO25JUL2\nJueves 17 de julio: CENCO25JUL3\nJueves 24 de julio: CENCO25JUL4\nJueves 31 de julio: CENCO25JUL5",
    "descuento": "$10.000 descuento en restaurantes ",
    "banco_nombre": "Cencosud",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "jueves"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 53,
    "establecimiento": "UberEats",
    "descripcion": "Los suscriptores de Uber One pueden optar a un 40% de rebaja en los restaurantes catalogados como \"Solo en Uber Eats\" y \"La Carta\" (tope de $2.000 de descuento). Por su parte, los usuarios sin suscripción recibirán un 30% de rebaja y máximo $1.500 de descuento por cada pedido. Si quieres usar este beneficio, tienes que descargar los códigos de descuento en la aplicación de Movistar.",
    "descuento": "a un 40% de rebaja en los restaurantes catalogados como \"Solo en Uber Eats\" y \"La Carta\"",
    "banco_nombre": "Movistar",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "jueves"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 54,
    "establecimiento": "Rappi",
    "descripcion": "25% de descuento en Little Caesars, con un tope de $10.000",
    "descuento": "25% de descuento en Little Caesars,",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "viernes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 55,
    "establecimiento": "PedidosYa",
    "descripcion": "20% de descuento en delivery de las compras realizadas en PedidosYa Market. Esta oferta tiene un tope de $7.000 y solamente se puede emplear en dos ocasiones al mes.",
    "descuento": "20% de descuento en delivery de las compras realizadas en PedidosYa Market.",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "viernes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 56,
    "establecimiento": "PedidosYa",
    "descripcion": "Los viernes de julio recibirás 30% OFF en restaurantes al pagar con la tarjeta Cencosud Scotiabank. La oferta es válida en una compra por usuario, tiene un tope de $10.000 y para validar el beneficio tienes que usar los siguientes códigos:\nViernes 11/07: CENCOJUL1125\nViernes 18/07: CENCOJUL1825\nViernes 25/07: CENCOJUL2525",
    "descuento": "30% OFF en restaurantes",
    "banco_nombre": "Cencosud",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "viernes"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 57,
    "establecimiento": " Rappi.",
    "descripcion": "$3.000 de rebaja en todo Rappi.",
    "descuento": "$3.000 de rebaja en todo Rappi.",
    "banco_nombre": "Copec Pay",
    "tipo_tarjeta": "debito",
    "categoria": "Delivery",
    "dias_validos": [
      "viernes",
      "sábado"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 58,
    "establecimiento": "PedidosYa",
    "descripcion": "Si eres un Usuario Plus puedes acceder a un 40% de rebaja en Hamburgueserías. Promoción disponible para una compra mensual y con un tope de $3.000 de descuento.",
    "descuento": "40% de rebaja en Hamburgueserías.",
    "banco_nombre": "MACH",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "viernes",
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 59,
    "establecimiento": "Rappi",
    "descripcion": "Los sábados de julio existe un 25% de descuento en el delivery de Kobo y Kento. Este beneficio es válido al usar las tarjetas de crédito o débito del Banco de Chile y en una compra al día, con un tope de $10.000 de descuento.",
    "descuento": " 25% de descuento en el delivery de Kobo y Kento.",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "sábado"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 60,
    "establecimiento": "Rappi",
    "descripcion": "30% de descuento en supermercados. Tope de $10.000.",
    "descuento": "30% de descuento en supermercados",
    "banco_nombre": "Coopeuch",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "sábado"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 61,
    "establecimiento": "Uber Eats",
    "descripcion": "40% de descuento para los miembros de Uber One que compren en todos los restaurantes de la app (tope de $2.000 por pedido). Mientras que los usuarios no suscritos obtendrán un 30% rebaja y tendrán un límite de $1.500 de descuento por pedido. Si quieres acceder a esta oferta tienes que descargar los cupones disponibles en la sección de beneficios de la App Movistar.",
    "descuento": "40% de descuento para los miembros de Uber One",
    "banco_nombre": "Movistar",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 62,
    "establecimiento": "PedidosYa",
    "descripcion": "30% de rebaja en la categoría \"mascotas\". El beneficio se puede emplear una vez por día y tiene un tope de $7.000 de descuento.",
    "descuento": "30% de rebaja en la categoría \"mascotas\".",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 63,
    "establecimiento": "PedidosYa",
    "descripcion": "Los usuarios de PedidosYa Plus recibirán un 30% de rebaja en toda la app. El beneficio se puede emplear una vez por fin de semana y con un límite de ahorro de $5.000.",
    "descuento": "Los usuarios de PedidosYa Plus recibirán un 30% de rebaja en toda la app.",
    "banco_nombre": "Banco Itaú",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "sábado",
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 64,
    "establecimiento": "Rappi",
    "descripcion": "30% de ahorro al comprar en restaurantes de la app. En este caso, el tope de rebaja es de $15.000.",
    "descuento": "30% de ahorro al comprar en restaurantes de la app",
    "banco_nombre": "Abc",
    "tipo_tarjeta": "credito",
    "categoria": "Delivery",
    "dias_validos": [
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  },
  {
    "id": 65,
    "establecimiento": "Rappi",
    "descripcion": "25% de rebaja en Roof Burger. Este beneficio es válido al usar las tarjetas de crédito o débito del Banco de Chile y en una compra al día, con un tope de $10.000 de descuento.",
    "descuento": "25% de rebaja en Roof Burger.",
    "banco_nombre": "Banco de Chile",
    "tipo_tarjeta": "ambas",
    "categoria": "Delivery",
    "dias_validos": [
      "domingo"
    ],
    "es_delivery": true,
    "terminos": "",
    "fecha_vencimiento": "",
    "activo": true
  }
]
};
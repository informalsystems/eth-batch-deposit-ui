'use client'

import { constants } from '@/app/batch-deposit/constants'
import { useAppContext } from '@/app/batch-deposit/context'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import { AppNotification } from '../app/batch-deposit/types'
import { Button } from './Button'
import { Notification } from './Notification'

export { Notifications }

const Notifications = () => {
  const {
    dispatch,
    state: { notifications },
  } = useAppContext()

  const hasNotifications = !!notifications.length

  const dismissNotifications = ({
    notificationIds,
  }: {
    notificationIds: AppNotification['id'][]
  }) =>
    dispatch({
      type: 'dismissNotifications',
      payload: {
        notificationIds,
      },
    })

  useEffect(() => {
    const confirmationNotifications = notifications.filter(
      ({ type }) => type === 'confirmation',
    )

    const timers = confirmationNotifications.map(({ id }, index) =>
      setTimeout(
        () =>
          dispatch({
            type: 'dismissNotifications',
            payload: {
              notificationIds: [id],
            },
          }),
        constants.dismissConfirmationNotificationsDelay + 200 * index,
      ),
    )

    return () => {
      timers.map(timer => clearTimeout(timer))
    }
  }, [dispatch, notifications])

  return (
    <div
      className={twMerge(
        `
          pointer-events-none
          fixed
          bottom-0
          right-0
          z-50
          flex
          w-96
          flex-col
          items-end
          gap-2
          p-6
          opacity-0
          transition-opacity
        `,
        hasNotifications &&
          `
            pointer-events-auto
            opacity-100
          `,
      )}
    >
      <div
        className="
          pointer-events-none
          absolute
          left-full
          top-full
          -z-10
          h-[50vh]
          w-[100vw]
          -translate-x-1/2
          -translate-y-1/2
          from-neutral-950
          to-neutral-950/0
          opacity-50
          transition-opacity
          bg-radient-ellipse-c
        "
      />

      {notifications.map(({ id, message, type }) => (
        <Notification
          key={id}
          variant={type}
          onDismiss={dismissNotifications.bind(null, {
            notificationIds: [id],
          })}
        >
          {message}
        </Notification>
      ))}

      {notifications.length >= 2 && (
        <Button
          className="
            rounded-full
            bg-white/80
            px-3
            py-1
            text-xs
            backdrop-blur-sm
          "
          iconName="xmark"
          variant="unstyled"
          onClick={dismissNotifications.bind(null, {
            notificationIds: notifications.map(({ id }) => id),
          })}
        >
          Dismiss All
        </Button>
      )}
    </div>
  )
}
